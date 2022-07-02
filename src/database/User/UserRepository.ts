import queryBuilder from 'dbschema/edgeql-js/index';
import { Confirmation, DataProcessor, DataSupplier, User } from '../models';
import { addWeeks } from 'date-fns';
import { markConfirmationAsUsed } from '../Confirmation/ConfirmationRepository';
import { MINIMUM_CHUNKS_FOR_PAYOUT } from '@/utils/constants';

export function getDataProcessorById(id: DataProcessor['id']) {
    return queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(id)),
    }));
}

export function getDataSupplierById(id: DataSupplier['id']) {
    return queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
        filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(id)),
        id: true,
    }));
}

export function markDataProcessorActivatedStripeAccount(id: DataProcessor['id']) {
    return queryBuilder.update(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(id)),
        set: {
            activatedStripeAccount: true,
        },
    }));
}

export function getDataSupplierUnattachedPayloads(id: DataSupplier['id']) {
    return queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
        filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(id)),
        payloads: (payload) => ({
            filter: queryBuilder.op('not', queryBuilder.op('exists', payload.payment)),
            id: true,
            jsonSchema: true,
            noChunks: queryBuilder.count(payload.chunks),
        }),
    }));
}

interface AddUserDetails {
    email: User['email'];
    role: User['role'];
    confirmationUuid: Confirmation['uuid'];
}

export function addUser({ email, role, confirmationUuid }: AddUserDetails) {
    return queryBuilder.insert(queryBuilder.User, {
        email,
        confirmation: queryBuilder.insert(queryBuilder.Confirmation, {
            uuid: confirmationUuid,
            expiresAt: addWeeks(new Date(), 1),
            wasUsed: false,
        }),
        role,
    });
}

export function addDataSupplier(userDetails: AddUserDetails) {
    return queryBuilder.insert(queryBuilder.DataSupplier, {
        userDetails: addUser(userDetails),
    });
}

export function addDataProcessor(userDetails: AddUserDetails) {
    return queryBuilder.insert(queryBuilder.DataProcessor, {
        userDetails: addUser(userDetails),
        activatedStripeAccount: false,
    });
}

export function completeUserAccount({
    confirmationUuid,
    password,
}: {
    confirmationUuid: Confirmation['uuid'];
    password: User['password'];
}) {
    return queryBuilder.update(
        markConfirmationAsUsed(confirmationUuid)['<confirmation[is User]'],
        (c) => ({
            set: {
                password: password,
            },
        })
    );
}

export function getUserByEmail(email: User['email']) {
    return queryBuilder.select(queryBuilder.User, (user) => ({
        filter: queryBuilder.op(user.email, '=', email),
        id: true,
        password: true,
        email: true,
        role: true,
        otpSecret: true,
    }));
}

export function getDataProcessorId(userId: User['id']) {
    return queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(dataProcessor.userDetails.id, '=', queryBuilder.uuid(userId)),
        id: true,
    }));
}

export function getDataSupplierId(userId: User['id']) {
    return queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
        filter: queryBuilder.op(dataSupplier.userDetails.id, '=', queryBuilder.uuid(userId)),
        id: true,
    }));
}

export function setUserOtpSecret({ id, secret }: { id: User['id']; secret: string }) {
    return queryBuilder.update(queryBuilder.User, (user) => ({
        filter: queryBuilder.op(user.id, '=', queryBuilder.uuid(id)),
        set: {
            otpSecret: secret,
        },
    }));
}

export function disableUser2FA(id: User['id']) {
    return queryBuilder.update(queryBuilder.User, (user) => ({
        filter: queryBuilder.op(user.id, '=', queryBuilder.uuid(id)),
        set: {
            otpSecret: null,
        },
    }));
}

export function getDataProcessorConnectedStripeId(id: DataProcessor['id']) {
    return queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(id)),
        connectedStripeAccountID: true,
    }));
}

export function setDataProcessorConnectedStripeId({
    id,
    connectedStripeAccountID,
}: {
    id: DataProcessor['id'];
    connectedStripeAccountID: DataProcessor['connectedStripeAccountID'];
}) {
    return queryBuilder.update(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(id)),
        set: {
            connectedStripeAccountID,
        },
    }));
}

export function getPayableDataProcessors() {
    return queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(
            queryBuilder.op(dataProcessor.activatedStripeAccount, '=', true),
            'and',
            queryBuilder.op(
                queryBuilder.count(dataProcessor.payable_chunks),
                '>',
                MINIMUM_CHUNKS_FOR_PAYOUT
            )
        ),
        id: true,
        connectedStripeAccountID: true,
        payable_chunks: true,
    }));
}
