import { EntityRepository, In, Repository } from 'typeorm';
import { DataProcessor } from '../DataProcessor/DataProcessor.js';
import { Chunk } from './Chunk.js';

@EntityRepository(Chunk)
export class ChunkRepository extends Repository<Chunk> {
    findById(id: Chunk['id']) {
        return this.findOne({ id });
    }

    getChunkOutputPath(id: Chunk['id']) {
        return this.findOne(
            {
                id,
            },
            {
                select: ['outputPath'],
            }
        );
    }

    getUnpaidChunksByDataProcessor(dataProcessorId: DataProcessor['id']) {
        return this.createQueryBuilder('chunk')
            .leftJoin('chunk.dataProcessor', 'dataProcessor')
            .select(['chunk.id'])
            .where(
                `dataProcessor.id = :dataProcessorId AND chunk.paidFor = 'f' AND chunk.processed = 't'`,
                { dataProcessorId }
            )
            .getMany();
    }

    markChunksAsPaid(chunkIds: number[]) {
        return this.update(
            {
                id: In(chunkIds),
            },
            { paidFor: true }
        );
    }
}
