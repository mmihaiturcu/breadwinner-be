import app from '@/config/App.js';
import { isBefore } from 'date-fns';
import { HTTPGoneError, HTTPConflictError } from '@/errors/index.js';
import { NotFoundError } from 'routing-controllers';

const confirmationRepository = app.confirmationRepository;

export async function verifyConfirmation(uuid: string) {
    const confirmation = await confirmationRepository.findByUUID(uuid);

    if (confirmation) {
        if (confirmation.wasUsed) {
            throw new HTTPConflictError('The confirmation link has already been used.');
        } else if (isBefore(confirmation.expiresAt, new Date())) {
            throw new HTTPGoneError(
                'The confirmation link is expired. Please create a new account.'
            );
        }
    } else {
        throw new NotFoundError('The confirmation link is invalid.');
    }

    return true;
}
