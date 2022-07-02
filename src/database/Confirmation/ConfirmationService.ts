import app from '@/config/App';
import { isBefore } from 'date-fns';
import { HTTPGoneError, HTTPConflictError } from '@/errors/index';
import { NotFoundError } from 'routing-controllers';
import { getConfirmationByUuid } from './ConfirmationRepository';
const { db } = app;

export async function verifyConfirmation(uuid: string) {
    const confirmations = await getConfirmationByUuid(uuid).run(db);

    if (confirmations.length) {
        const confirmation = confirmations[0];
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
