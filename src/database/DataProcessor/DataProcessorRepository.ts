import { MINIMUM_CHUNKS_FOR_PAYOUT } from '@/utils/constants.js';
import { EntityRepository, Repository } from 'typeorm';
import { DataProcessor } from './DataProcessor.js';

@EntityRepository(DataProcessor)
export class DataProcessorRepository extends Repository<DataProcessor> {
    findById(id: DataProcessor['id']) {
        return this.findOne({ id });
    }

    async getPayableDataProcessors(): Promise<
        (Pick<DataProcessor, 'id' | 'connectedStripeAccountID'> & { noUnpaidChunks: number })[]
    > {
        return (await this.createQueryBuilder('data_processor')
            .leftJoinAndSelect('data_processor.chunks', 'chunk')
            .select(['data_processor.id', 'data_processor.connectedStripeAccountID'])
            .where(
                `data_processor.activatedStripeAccount = 't' AND chunk.processed = 't' AND chunk.paidFor = 'f'`
            )
            .groupBy('data_processor.id')
            .having(`COUNT("chunk"."id") > ${MINIMUM_CHUNKS_FOR_PAYOUT}`)
            .getMany()) as unknown as (Pick<DataProcessor, 'id' | 'connectedStripeAccountID'> & {
            noUnpaidChunks: number;
        })[];
    }
}
