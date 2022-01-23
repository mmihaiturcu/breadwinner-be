import { getUUIDV4, hashAndSaltPasswordToHex } from '@/utils/helper.js';

import { addWeeks } from 'date-fns';

import app from '@/config/App.js';
import { UserCreateRequest } from '@/types/payloads/requests/index.js';
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
import { UserFinishRequest } from '@/types/payloads/requests/ApplicationUserFinishRequest.js';
import { NotFoundError } from 'routing-controllers';

const userRepository = app.userRepository;
const confirmationRepository = app.confirmationRepository;
const dataSupplierRepository = app.dataSupplierRepository;
const dataProcessorRepository = app.dataProcessorRepository;

export async function createUser(payload: UserCreateRequest): Promise<void> {
    // 1. Create the User
    const user = await userRepository.save(new User(payload.email));

    // 2. Create either a DataSupplier or DataProcessor
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

    // 3. Create Confirmation for the user
    const confirmation = new Confirmation(getUUIDV4(), addWeeks(new Date(), 1), user);

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
                ],
                [
                    {
                        text: 'Finish',
                        url: `${FRONTEND_URL}/confirmation/${confirmation.uuid}`,
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
        await userRepository.update(user.id, {
            password: hashAndSaltPasswordToHex(payload.password),
        });
        await confirmationRepository.update(confirmationWithUser.id, {
            wasUsed: true,
        });
    } else {
        throw new NotFoundError('No user matching the specified confirmation was found.');
    }
}
