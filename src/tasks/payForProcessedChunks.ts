import cron from 'node-cron';
import app from '@/config/App.js';
import { PAYMENT_OFFERED_PER_CHUNK } from '@/utils/constants.js';

const { dataProcessorRepository, stripe, chunkRepository } = app;

// Every week, at 00:00 on a Monday.
cron.schedule('0 * * * 1', async () => {
    try {
        const payableDataProcessors = await dataProcessorRepository.getPayableDataProcessors();
        for (const dataProcessor of payableDataProcessors) {
            try {
                const chunksToPay = await chunkRepository.getUnpaidChunksByDataProcessor(
                    dataProcessor.id
                );
                // Done in order to always make sure the cents value is whole.
                const payableChunksNo =
                    chunksToPay.length % 2 === 0 ? chunksToPay.length : chunksToPay.length - 1;
                await chunkRepository.markChunksAsPaid(
                    chunksToPay.slice(0, payableChunksNo).map((chunk) => chunk.id)
                );
                await stripe.transfers.create({
                    currency: 'usd',
                    amount: PAYMENT_OFFERED_PER_CHUNK * payableChunksNo * 100,
                    destination: dataProcessor.connectedStripeAccountID,
                });
            } catch (err) {
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
});
