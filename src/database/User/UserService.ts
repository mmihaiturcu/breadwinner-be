import { getUUIDV4, hashAndSaltPasswordToHex, timingSafeEqualStrings } from '@/utils/helper.js';
import { addWeeks } from 'date-fns';
import { randomBytes, timingSafeEqual } from 'crypto';
import app from '@/config/App.js';
import {
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
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { UserLoginResponse } from '@/types/payloads/responses/UserLoginResponse.js';
import { QueryFailedError } from 'typeorm';
import { HTTPConflictError } from '@/errors/HTTPConflictError.js';

const userRepository = app.userRepository;
const confirmationRepository = app.confirmationRepository;
const dataSupplierRepository = app.dataSupplierRepository;
const dataProcessorRepository = app.dataProcessorRepository;

const textEncoder = new TextEncoder();
export async function createUser(payload: UserCreateRequest): Promise<void> {
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

    // 4. Send email to user
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

export async function loginUser(payload: UserLoginRequest): Promise<UserLoginResponse> {
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
                id: user.id,
                email: user.email,
                role: user.role,
            };
        } else {
            throw new UnauthorizedError('No user matching the supplied credentials was found.');
        }
    } else {
        throw new UnauthorizedError('No user matching the supplied credentials was found.');
    }
}
