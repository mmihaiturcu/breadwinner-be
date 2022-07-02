import App from '@/config/App';
import { JSONSchema } from '@/types/models/index';
import { MIN_PAYLOAD_PRICE, PRICE_PER_CHUNK, PRICE_PER_OPERATION } from '@/utils/constants';
import { User, DataSupplier } from '../models/index';
import { NotFoundError } from 'routing-controllers';
import { getDataSupplierUnattachedPayloads } from '../User/UserRepository';
import { createPayment, getOngoingPaymentByDataSupplier } from './PaymentRepository';
const { db, stripe } = App;

export async function createPaymentForUnattachedPayloads(
    userId: DataSupplier['id'],
    email: User['email']
) {
    // Get payloads without any payment attached.
    const dataSupplier = await getDataSupplierUnattachedPayloads(userId).run(db);

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
            success_url: process.env.FRONTEND_URL,
            cancel_url: process.env.FRONTEND_URL,
            customer_email: email,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        product: process.env.DATA_PROCESSING_PRODUCT_STRIPE_ID,
                        unit_amount: stringPrice,
                        currency: 'usd',
                    },
                },
            ],
            metadata: {
                payloadId: payloads[0].id,
            },
        });

        await createPayment({
            payloads,
            dataSupplierId: userId,
            paymentDetails: {
                stripeSessionId: session.id,
                stripeCheckoutUrl: session.url!,
            },
        }).run(db);

        return session.url;
    } else {
        throw new NotFoundError('No unattached payloads found for the supplied user.');
    }
}

export async function getOngoingSessionCheckoutLink(userId: DataSupplier['id']) {
    const ongoingPayment = (await getOngoingPaymentByDataSupplier(userId).run(db))[0];
    if (ongoingPayment) {
        console.log(ongoingPayment);
        return ongoingPayment.stripeCheckoutURL;
    } else {
        return '';
    }
}
