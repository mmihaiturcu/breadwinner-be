import { getUUIDV4 } from '@/utils/helper';
import { addWeeks } from 'date-fns';
import app from '@/config/App';
import {
    Enable2FARequest,
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
} from '@/types/payloads/requests/index';
import {
    getContentWithMessageAndButton,
    getGeneralEmailTemplate,
    sendMail,
} from '@/utils/emailService';
import { ARGON_OPTIONS, FRONTEND_URL, USER_ROLE_TO_STRING } from '@/utils/constants';
import { BadRequestError, InternalServerError, UnauthorizedError } from 'routing-controllers';
import { UserDetails } from '@/types/payloads/responses/UserDetails';
import { HTTPConflictError } from '@/errors/HTTPConflictError';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { GetTrialQRCodeResponse } from '@/types/payloads/responses/GetTrialQRCodeResponse';
import { Role, User } from '../models/index';
import argon2 from 'argon2';
const { hash, verify } = argon2;
import queryBuilder from 'dbschema/edgeql-js/index';
const { db } = app;

export async function createUser(
    payload: UserCreateRequest
): Promise<{ email: string; role: Role; uuid: string }> {
    const uuid = getUUIDV4();
    // 1. Create Confirmation for the user
    const confirmation = queryBuilder.insert(queryBuilder.Confirmation, {
        uuid,
        expiresAt: addWeeks(new Date(), 1),
        wasUsed: false,
    });

    const user = queryBuilder.insert(queryBuilder.User, {
        email: payload.email,
        confirmation,
        role: payload.userRole,
    });

    // 2. Create either a DataSupplier or DataProcessor
    try {
        switch (payload.userRole) {
            case Role.DATA_SUPPLIER: {
                const query = queryBuilder.insert(queryBuilder.DataSupplier, {
                    userDetails: user,
                });
                await query.run(db);
                break;
            }
            case Role.DATA_PROCESSOR: {
                const query = queryBuilder.insert(queryBuilder.DataProcessor, {
                    userDetails: user,
                    activatedStripeAccount: false,
                });
                await query.run(db);
                break;
            }
        }
    } catch (error) {
        console.log(error);
        // 2.1 Handle the case in which another user with the same email exists.
        throw new HTTPConflictError('A user with the specified email address already exists.');
    }

    return {
        email: payload.email,
        role: payload.userRole,
        uuid,
    };
}

export async function sendAccountConfirmationEmail(email: string, role: Role, uuid: string) {
    await sendMail({
        to: email,
        subject: 'Your Breadwinner account confirmation link awaits!',
        html: getGeneralEmailTemplate(
            'Your Breadwinner account confirmation link awaits!',
            getContentWithMessageAndButton(
                [
                    `Thank you for signing up for a Breadwinner ${USER_ROLE_TO_STRING[role]} account!`,
                    'Please click on the button below in order to set a password.',
                ],
                [
                    {
                        text: 'Set password',
                        url: `${FRONTEND_URL}/#/confirmation?uuid=${uuid}`,
                    },
                ]
            )
        ),
    });
}

export async function finishUserAccount(payload: UserFinishRequest): Promise<void> {
    const confirmation = queryBuilder.update(queryBuilder.Confirmation, (confirmation) => ({
        filter: queryBuilder.op(confirmation.uuid, '=', payload.confirmationUuid),
        set: {
            wasUsed: true,
        },
    }));

    const hashedPassword = await hash(payload.password, ARGON_OPTIONS);

    const query = queryBuilder.update(confirmation['<confirmation[is User]'], (c) => ({
        set: {
            password: hashedPassword,
        },
    }));

    await query.run(db);
}

export async function loginUser(
    payload: UserLoginRequest
): Promise<{ userDetails: UserDetails; secretFor2FA: User['otpSecret'] }> {
    const query = queryBuilder.select(queryBuilder.User, (user) => ({
        filter: queryBuilder.op(user.email, '=', payload.email),
        id: true,
        password: true,
        email: true,
        role: true,
        otpSecret: true,
    }));

    const user = await query.run(db);

    if (user) {
        if (user.password && (await verify(user.password, payload.password, ARGON_OPTIONS))) {
            const roleSpecificDetails = await (user.role === 'DATA_PROCESSOR'
                ? queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
                      filter: queryBuilder.op(
                          dataProcessor.userDetails.id,
                          '=',
                          queryBuilder.uuid(user.id)
                      ),
                      id: true,
                  }))
                : queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
                      filter: queryBuilder.op(
                          dataSupplier.userDetails.id,
                          '=',
                          queryBuilder.uuid(user.id)
                      ),
                      id: true,
                  }))
            ).run(db);

            console.log(
                'login',
                'base user id',
                user.id,
                'specific role id',
                roleSpecificDetails[0].id
            );

            return {
                userDetails: {
                    id: user.id,
                    roleSpecificId: roleSpecificDetails[0].id,
                    email: user.email,
                    role: user.role as Role,
                },
                secretFor2FA: user.otpSecret,
            };
        } else {
            throw new UnauthorizedError('No user matching the supplied credentials was found.');
        }
    } else {
        throw new UnauthorizedError('No user matching the supplied credentials was found.');
    }
}

export async function createDefaultUsers(): Promise<void> {
    const creationPayloadThalros = await createUser({
        email: 'thalros1760@gmail.com',
        userRole: Role.DATA_SUPPLIER,
    });

    await finishUserAccount({
        confirmationUuid: creationPayloadThalros.uuid,
        password: 'Pass!123',
    });

    const creationPayloadMihai = await createUser({
        email: 'mihai.turcu1760@gmail.com',
        userRole: Role.DATA_PROCESSOR,
    });

    await finishUserAccount({
        confirmationUuid: creationPayloadMihai.uuid,
        password: 'Pass!123',
    });
}

export function validateResourceBelongsToSessionUser(
    sessionUserId: User['id'],
    userId: User['id']
) {
    const resourceBelongsToSession = sessionUserId === userId;
    if (!resourceBelongsToSession) {
        throw new UnauthorizedError(
            'Resource does not belong to the user attached to this session'
        );
    }
}

export async function getTrialQRCode(userEmail: User['email']): Promise<GetTrialQRCodeResponse> {
    try {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(userEmail, 'Breadwinner', secret);
        const qrCodeDataURI = await toDataURL(otpauth);
        return { qrCodeDataURI, secret: secret };
    } catch (err) {
        throw new InternalServerError('Could not generate trial QR code.');
    }
}

export async function enable2FA(userId: User['id'], payload: Enable2FARequest) {
    const verified = authenticator.verify({
        secret: payload.secret,
        token: payload.token,
    });
    if (verified) {
        const query = queryBuilder.update(queryBuilder.User, (user) => ({
            filter: queryBuilder.op(user.id, '=', queryBuilder.uuid(userId)),
            set: {
                otpSecret: payload.secret,
            },
        }));
        await query.run(db);
    } else {
        throw new BadRequestError(
            'Token is incorrect or stale, validation could not be performed.'
        );
    }
}

export async function disable2FA(userId: User['id']) {
    const query = queryBuilder.update(queryBuilder.User, (user) => ({
        filter: queryBuilder.op(user.id, '=', queryBuilder.uuid(userId)),
        set: {
            otpSecret: null,
        },
    }));

    await query.run(db);
}

export function validate2FAToken(secret: User['otpSecret'], token: string) {
    const validated = authenticator.verify({
        secret: secret!,
        token,
    });

    if (!validated) {
        throw new UnauthorizedError('2FA Token is invalid.');
    }
}

export async function getConnectedStripeAccountLink(userId: User['id']) {
    const dataProcessor = await queryBuilder
        .select(queryBuilder.DataProcessor, (dataProcessor) => ({
            filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(userId)),
            connectedStripeAccountID: true,
        }))
        .run(db);

    if (dataProcessor) {
        let connectedStripeAccountID = dataProcessor.connectedStripeAccountID;

        if (!connectedStripeAccountID) {
            const account = await app.stripe.accounts.create({
                type: 'express',
                metadata: {
                    id: String(userId),
                },
                country: 'US',
            });
            connectedStripeAccountID = account.id;
            await queryBuilder
                .update(queryBuilder.DataProcessor, (dataProcessor) => ({
                    filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(userId)),
                    set: {
                        connectedStripeAccountID,
                    },
                }))
                .run(db);
        }
        try {
            const accountLink = await app.stripe.accountLinks.create({
                account: connectedStripeAccountID,
                refresh_url: FRONTEND_URL,
                return_url: FRONTEND_URL,
                // type: dataProcessor.activatedStripeAccount ? 'account_update' : 'account_onboarding',
                type: 'account_onboarding',
            });
            return accountLink.url;
        } catch (err) {
            console.log(err);
        }
    }
}
