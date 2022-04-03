import { Chunk } from '@/database/models/index';

export interface ChunkProcessedEventData {
    chunkId: Chunk['id'];
    result: string;
    token: string;
}
