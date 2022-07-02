import cron from 'node-cron';
import app from '@/config/App';
import { unlink } from 'fs';
import { resolve } from 'path';
import { CHUNK_INPUT_SAVE_PATH, CHUNK_OUTPUT_SAVE_PATH } from '@/utils/constants';
import { doNothing } from '@/utils/helper';
import { deletePayments, getPendingPayments } from '@/database/Payment/PaymentRepository';
import { deleteChunks } from '@/database/Chunk/ChunkRepository';
const { db, stripe } = app;

if (process.argv[3] === 'MAIN_SERVER') {
    // Every hour, on the dot.
    cron.schedule('0 * * * *', async () => {
        try {
            const pendingPayments = await getPendingPayments().run(db);
            console.log('pending payments', pendingPayments);
            if (pendingPayments.length) {
                const paymentsToRemoveIds: string[] = [];
                const chunksToRemoveIds: string[] = [];
                for (const payment of pendingPayments) {
                    try {
                        await stripe.checkout.sessions.expire(payment.stripeSessionID);
                        for (const payload of payment.payloads) {
                            for (const chunk of payload.chunks) {
                                chunksToRemoveIds.push(chunk.id);
                                unlink(resolve(CHUNK_INPUT_SAVE_PATH, `${chunk.id}`), doNothing);
                                unlink(resolve(CHUNK_OUTPUT_SAVE_PATH, `${chunk.id}`), doNothing);
                            }
                        }
                        paymentsToRemoveIds.push(payment.id);
                    } catch (err) {
                        // Payment has already been paid, ignore it, it will transition to paid state soon
                        console.log(err);
                    }
                }
                const removedPayments = await deletePayments(paymentsToRemoveIds).run(db);
                const removedChunks = await deleteChunks(chunksToRemoveIds).run(db);
                console.log('Removed payments', removedPayments);
                console.log('Removed chunks', removedChunks);
            }
        } catch (err) {
            console.log(err);
        }
    });
}
