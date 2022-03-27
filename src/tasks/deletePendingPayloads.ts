import cron from 'node-cron';
import app from '@/config/App.js';
import { unlink } from 'fs';
import { resolve } from 'path';
import { INPUT_SAVE_PATH, OUTPUT_SAVE_PATH } from '@/utils/constants.js';
import { doNothing } from '@/utils/helper.js';
import Stripe from 'stripe';

const { paymentRepository, stripe } = app;

// Every hour, on the dot.
cron.schedule('0 * * * *', async () => {
    try {
        const pendingPayments = await paymentRepository.getPendingPaymentsOlderThanAnHour();
        if (pendingPayments.length) {
            const paymentsToRemove = [];
            for (const payment of pendingPayments) {
                try {
                    await stripe.checkout.sessions.expire(payment.stripeSessionID);
                    for (const payload of payment.payloads) {
                        for (const chunk of payload.chunks) {
                            unlink(resolve(INPUT_SAVE_PATH, `${chunk.id}`), doNothing);
                            unlink(resolve(OUTPUT_SAVE_PATH, `${chunk.id}`), doNothing);
                        }
                    }
                    paymentsToRemove.push(payment);
                } catch (err) {
                    if (err instanceof Stripe.StripeInvalidRequestError) {
                        // Payment has already been paid, ignore it, it will transition to paid state soon
                        console.log(err);
                    }
                }
            }
            const removedPayments = await paymentRepository.remove(paymentsToRemove);
            console.log('Removed payments', removedPayments);
        }
    } catch (err) {
        console.log(err);
    }
});
