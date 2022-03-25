import { getUUIDV4, hashAndSaltPasswordToHex, timingSafeEqualStrings } from '@/utils/helper.js';
import { addWeeks } from 'date-fns';
import { randomBytes } from 'crypto';
import app from '@/config/App.js';
import {
    Enable2FARequest,
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
} from '@/types/payloads/requests/index.js';
import { User } from './User.js';
import { Role } from '@/types/enums/Role.js';
import { DataSupplier } from '../DataSupplier/DataSupplier.js';
import { DataProcessor } from '../DataProcessor/DataProcessor.js';
import { Confirmation } from '../Confirmation/Confirmation.js';
import {
    getContentWithMessageAndButton,
    getGeneralEmailTemplate,
    sendMail,
} from '@/utils/emailService.js';
import { FRONTEND_URL, USER_ROLE_TO_STRING } from '@/utils/constants.js';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
} from 'routing-controllers';
import { UserDetails } from '@/types/payloads/responses/UserDetails.js';
import { QueryFailedError } from 'typeorm';
import { HTTPConflictError } from '@/errors/HTTPConflictError.js';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { GetTrialQRCodeResponse } from '@/types/payloads/responses/GetTrialQRCodeResponse.js';

const userRepository = app.userRepository;
const confirmationRepository = app.confirmationRepository;
const dataSupplierRepository = app.dataSupplierRepository;
const dataProcessorRepository = app.dataProcessorRepository;

export async function createUser(
    payload: UserCreateRequest
): Promise<{ user: User; confirmation: Confirmation }> {
    // 1. Create the User
    const user = new User(payload.email, payload.userRole);

    // 2. Create either a DataSupplier or DataProcessor
    try {
        switch (payload.userRole) {
            case Role.DATA_SUPPLIER: {
                await dataSupplierRepository.save(new DataSupplier(user));
                break;
            }
            case Role.DATA_PROCESSOR: {
                await dataProcessorRepository.save(new DataProcessor(user));
                break;
            }
        }
    } catch (error) {
        // 2.1 Handle the case in which another user with the same email exists.
        if (error instanceof QueryFailedError) {
            throw new HTTPConflictError('A user with the specified email address already exists.');
        }
    }

    // 3. Create Confirmation for the user
    const confirmation = new Confirmation(getUUIDV4(), addWeeks(new Date(), 1), user);
    await confirmationRepository.save(confirmation);

    return {
        user,
        confirmation,
    };
}

export async function sendAccountConfirmationEmail(user: User, confirmation: Confirmation) {
    await sendMail({
        to: user.email,
        subject: 'Your Breadwinner account confirmation link awaits!',
        html: getGeneralEmailTemplate(
            'Your Breadwinner account confirmation link awaits!',
            getContentWithMessageAndButton(
                [
                    `Thank you for signing up for a Breadwinner ${
                        USER_ROLE_TO_STRING[user.role]
                    } account!`,
                    'Please click on the button below in order to set a password.',
                ],
                [
                    {
                        text: 'Set password',
                        url: `${FRONTEND_URL}/#/confirmation?uuid=${confirmation.uuid}`,
                    },
                ]
            )
        ),
    });
}

export async function finishUserAccount(payload: UserFinishRequest): Promise<void> {
    const confirmationWithUser = await confirmationRepository.findOne({
        relations: ['user'],
        where: {
            uuid: payload.confirmationUuid,
        },
    });

    const user = confirmationWithUser.user;

    if (user) {
        const salt = randomBytes(16);
        await userRepository.update(user.id, {
            password: hashAndSaltPasswordToHex(payload.password, salt),
            salt: salt.toString('hex'),
        });
        await confirmationRepository.update(confirmationWithUser.id, {
            wasUsed: true,
        });
    } else {
        throw new NotFoundError('No user matching the specified confirmation was found.');
    }
}

export async function loginUser(
    payload: UserLoginRequest
): Promise<{ userDetails: UserDetails; secretFor2FA: User['otpSecret'] }> {
    const user = await userRepository.findOne({
        email: payload.email,
    });

    if (user) {
        if (
            user.password &&
            timingSafeEqualStrings(
                user.password,
                hashAndSaltPasswordToHex(payload.password, Buffer.from(user.salt, 'hex'))
            )
        ) {
            return {
                userDetails: { id: user.id, email: user.email, role: user.role },
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
        confirmationUuid: creationPayloadThalros.confirmation.uuid,
        password: 'Pass!123',
    });

    const creationPayloadMihai = await createUser({
        email: 'mihai.turcu1760@gmail.com',
        userRole: Role.DATA_PROCESSOR,
    });

    await finishUserAccount({
        confirmationUuid: creationPayloadMihai.confirmation.uuid,
        password: 'Pass!123',
    });
}

export function validateResourceBelongsToSessionUser(sessionUserId, userId) {
    const resourceBelongsToSession = sessionUserId === userId;
    if (!resourceBelongsToSession) {
        throw new UnauthorizedError(
            'Resource does not belong to the user attached to this session'
        );
    }
}

export async function getTrialQRCode(userEmail): Promise<GetTrialQRCodeResponse> {
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
        const user = await userRepository.findById(userId);
        user.otpSecret = payload.secret;
        await userRepository.save(user);
    } else {
        throw new BadRequestError(
            'Token is incorrect or stale, validation could not be performed.'
        );
    }
}

export async function disable2FA(userId: User['id']) {
    const user = await userRepository.findById(userId);

    if (user) {
        user.otpSecret = null;
        await userRepository.save(user);
    } else {
        throw new NotFoundError('User not found.');
    }
}

export function validate2FAToken(secret: User['otpSecret'], token: string) {
    const validated = authenticator.verify({
        secret,
        token,
    });

    if (!validated) {
        throw new UnauthorizedError('2FA Token is invalid.');
    }
}

export async function getConnectedStripeAccountLink(userId: User['id']) {
    const dataProcessor = await dataProcessorRepository.findById(userId);

    if (!dataProcessor.connectedStripeAccountID) {
        const account = await app.stripe.accounts.create({
            type: 'express',
            metadata: {
                id: String(userId),
            },
        });
        dataProcessor.connectedStripeAccountID = account.id;
        await dataProcessorRepository.save(dataProcessor);
    }

    const accountLink = await app.stripe.accountLinks.create({
        account: dataProcessor.connectedStripeAccountID,
        refresh_url: FRONTEND_URL,
        return_url: FRONTEND_URL,
        type: dataProcessor.activatedStripeAccount ? 'account_update' : 'account_onboarding',
    });
    return accountLink.url;
}
