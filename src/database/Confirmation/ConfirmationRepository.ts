import { Confirmation } from '../models';
import queryBuilder from 'dbschema/edgeql-js/index';

export function getConfirmationByUuid(uuid: Confirmation['uuid']) {
    return queryBuilder.select(queryBuilder.Confirmation, (confirmation) => ({
        filter: queryBuilder.op(confirmation.uuid, '=', uuid),
        wasUsed: true,
        expiresAt: true,
    }));
}

export function markConfirmationAsUsed(uuid: Confirmation['uuid']) {
    return queryBuilder.update(queryBuilder.Confirmation, (confirmation) => ({
        filter: queryBuilder.op(confirmation.uuid, '=', uuid),
        set: {
            wasUsed: true,
        },
    }));
}
