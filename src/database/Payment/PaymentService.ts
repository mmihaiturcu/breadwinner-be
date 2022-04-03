import App from '@/config/App';
import { JSONSchema } from '@/types/models/index';
import {
    DATA_PROCESSING_PRODUCT_STRIPE_ID,
    FRONTEND_URL,
    MIN_PAYLOAD_PRICE,
    PRICE_PER_CHUNK,
    PRICE_PER_OPERATION,
} from '@/utils/constants';
import { User, DataSupplier, PaymentState } from '../models/index';
import queryBuilder from 'dbschema/edgeql-js/index';
import { NotFoundError } from 'routing-controllers';
const { db, stripe } = App;

export async function createPaymentForUnattachedPayloads(
    userId: DataSupplier['id'],
    email: User['email']
) {
    // Get payloads without any payment attached.
    const dataSupplier = await queryBuilder
        .select(queryBuilder.DataSupplier, (dataSupplier) => ({
            filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(userId)),
            payloads: (payload) => ({
                filter: queryBuilder.op('not', queryBuilder.op('exists', payload.payment)),
                id: true,
                jsonSchema: true,
                noChunks: queryBuilder.count(payload.chunks),
            }),
        }))
        .run(db);

    if (dataSupplier && dataSupplier.payloads.length) {
        const payloads = dataSupplier.payloads;
        let price = 0;

        for (const payload of payloads) {
            price +=
                PRICE_PER_CHUNK * payload.noChunks +
                PRICE_PER_OPERATION *
                    (JSON.parse(payload.jsonSchema) as JSONSchema).operations.length *
                    payload.noChunks;
        }
        const stringPrice = Math.floor(
            Number(Math.max(MIN_PAYLOAD_PRICE, price).toPrecision(2)) * 100
        );

        console.log('string price is', stringPrice);

        // Create stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: FRONTEND_URL,
            cancel_url: FRONTEND_URL,
            customer_email: email,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        product: DATA_PROCESSING_PRODUCT_STRIPE_ID,
                        unit_amount: stringPrice,
                        currency: 'usd',
                    },
                },
            ],
            metadata: {
                payloadId: payloads[0].id,
            },
        });

        // Create Payment
        const payment = queryBuilder.insert(queryBuilder.Payment, {
            stripeSessionID: session.id,
            stripeCheckoutURL: session.url!,
            dataSupplier: queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
                filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(userId)),
            })),
            createdAt: new Date(),
            paymentState: PaymentState.PENDING,
        });

        await queryBuilder
            .update(queryBuilder.Payload, (payload) => ({
                filter: queryBuilder.op(
                    payload.id,
                    'in',
                    queryBuilder.set(...payloads.map((p) => queryBuilder.uuid(p.id)))
                ),
                set: {
                    payment,
                },
            }))
            .run(db);

        return session.url;
    } else {
        throw new NotFoundError('No unattached payloads found for the supplied user.');
    }
}

export async function getOngoingSessionCheckoutLink(userId: DataSupplier['id']) {
    const ongoingPayment = (
        await queryBuilder
            .select(queryBuilder.Payment, (payment) => ({
                filter: queryBuilder.op(
                    queryBuilder.op(payment.dataSupplier.id, '=', queryBuilder.uuid(userId)),
                    'and',
                    queryBuilder.op(payment.paymentState, '=', queryBuilder.PaymentState.PENDING)
                ),

                stripeCheckoutURL: true,
            }))
            .run(db)
    )[0];
    if (ongoingPayment) {
        console.log(ongoingPayment);
        return ongoingPayment.stripeCheckoutURL;
    } else {
        return '';
    }
}
