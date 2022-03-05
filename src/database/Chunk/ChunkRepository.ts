import { EntityRepository, Repository } from 'typeorm';
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
}
