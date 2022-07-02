import cron from 'node-cron';
import app from '@/config/App';
import { PAYMENT_OFFERED_PER_CHUNK } from '@/utils/constants';
import { getPayableDataProcessors } from '@/database/User/UserRepository';
import { markChunksAsPaid } from '@/database/Chunk/ChunkRepository';
const { db, stripe } = app;

if (process.argv[3] === 'MAIN_SERVER') {
    // Every week, at 00:00 on a Monday.
    cron.schedule('0 * * * 1', async () => {
        try {
            const payableDataProcessors = await getPayableDataProcessors().run(db);
            console.log('payable data processors', payableDataProcessors);
            for (const dataProcessor of payableDataProcessors) {
                try {
                    const noPayableChunks = dataProcessor.payable_chunks.length;
                    // Done in order to always make sure the cents value is whole.
                    const chunksThatCanBePaid =
                        noPayableChunks % 2 === 0 ? noPayableChunks : noPayableChunks - 1;

                    await markChunksAsPaid(
                        dataProcessor.payable_chunks.slice(0, chunksThatCanBePaid)
                    ).run(db);

                    await stripe.transfers.create({
                        currency: 'usd',
                        amount:
                            Number(
                                (PAYMENT_OFFERED_PER_CHUNK * chunksThatCanBePaid).toPrecision(2)
                            ) * 100,
                        destination: dataProcessor.connectedStripeAccountID!,
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}
