import App from '@/config/App.js';
import {
    DATA_PROCESSING_PRODUCT_STRIPE_ID,
    FRONTEND_URL,
    MIN_PAYLOAD_PRICE,
    PRICE_PER_CHUNK,
    PRICE_PER_OPERATION,
} from '@/utils/constants.js';
import { Payment, User, DataProcessor } from '../models/index.js';

const { payloadRepository, dataSupplierRepository, stripe, paymentRepository } = App;

export async function createPaymentForUnattachedPayloads(
    userId: DataProcessor['id'],
    email: User['email']
) {
    // Get unattached payloads
    const payloads = await payloadRepository.getUnattachedPayloads(userId);

    let price = 0;

    for (const payload of payloads) {
        price +=
            PRICE_PER_CHUNK * payload.noChunks +
            PRICE_PER_OPERATION * payload.jsonSchema.operations.length * payload.noChunks;
    }
    const stringPrice = Math.floor(Number(Math.max(MIN_PAYLOAD_PRICE, price).toPrecision(2)) * 100);

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

    const dataSupplier = await dataSupplierRepository.findById(userId);

    const payment = new Payment(dataSupplier, session.id, session.url);

    const savedPayment = await paymentRepository.save(payment);

    for (const payload of payloads) {
        payload.payment = savedPayment;
    }

    await payloadRepository.updatePayloadsPayment(
        payloads.map((payload) => payload.id),
        savedPayment
    );

    return session.url;
}

export async function getOngoingSessionCheckoutLink(userId: DataProcessor['id']) {
    const ongoingPayment = await paymentRepository.getOngoingPayment(userId);
    if (ongoingPayment) {
        return ongoingPayment.stripeCheckoutURL;
    } else {
        return '';
    }
}
