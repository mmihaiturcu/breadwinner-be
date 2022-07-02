import queryBuilder from 'dbschema/edgeql-js/index';
import { DataSupplier, Payload, Payment, PaymentState } from '../models';
import { subHours } from 'date-fns';

export function createPayment({
    payloads,
    dataSupplierId,
    paymentDetails,
}: {
    payloads: { id: Payload['id']; jsonSchema: Payload['jsonSchema']; noChunks: number }[];
    dataSupplierId: DataSupplier['id'];
    paymentDetails: { stripeSessionId: string; stripeCheckoutUrl: string };
}) {
    return queryBuilder.update(queryBuilder.Payload, (payload) => ({
        filter: queryBuilder.op(
            payload.id,
            'in',
            queryBuilder.set(...payloads.map((p) => queryBuilder.uuid(p.id)))
        ),
        set: {
            payment: queryBuilder.insert(queryBuilder.Payment, {
                stripeSessionID: paymentDetails.stripeSessionId,
                stripeCheckoutURL: paymentDetails.stripeCheckoutUrl,
                dataSupplier: queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
                    filter: queryBuilder.op(
                        dataSupplier.id,
                        '=',
                        queryBuilder.uuid(dataSupplierId)
                    ),
                })),
                createdAt: new Date(),
                paymentState: PaymentState.PENDING,
            }),
        },
    }));
}

export function getOngoingPaymentByDataSupplier(id: DataSupplier['id']) {
    return queryBuilder.select(queryBuilder.Payment, (payment) => ({
        filter: queryBuilder.op(
            queryBuilder.op(payment.dataSupplier.id, '=', queryBuilder.uuid(id)),
            'and',
            queryBuilder.op(payment.paymentState, '=', queryBuilder.PaymentState.PENDING)
        ),

        stripeCheckoutURL: true,
    }));
}

export function getPendingPayments() {
    return queryBuilder.select(queryBuilder.Payment, (payment) => ({
        filter: queryBuilder.op(
            queryBuilder.op(payment.paymentState, '=', queryBuilder.PaymentState.PENDING),
            'and',
            queryBuilder.op(payment.createdAt, '<', subHours(new Date(), 1))
        ),
        id: true,
        stripeSessionID: true,
        payloads: {
            chunks: {
                id: true,
            },
        },
    }));
}

export function deletePayments(paymentIds: Payment['id'][]) {
    return queryBuilder.delete(queryBuilder.Payment, (payment) => ({
        filter: queryBuilder.op(
            payment.id,
            'in',
            queryBuilder.set(...paymentIds.map((id) => queryBuilder.uuid(id)))
        ),
    }));
}
