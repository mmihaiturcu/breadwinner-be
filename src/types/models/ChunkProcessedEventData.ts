import { Chunk } from '@/database/models';

export interface ChunkProcessedEventData {
    chunkId: Chunk['id'];
    result: string;
}
