import app from '@/config/App';
import { Chunk } from '../models';
import { resolve as pathResolve } from 'path';
import { CHUNK_OUTPUT_SAVE_PATH } from '@/utils/constants';
import { NotFoundError } from 'routing-controllers';
import { readFilePromise } from '@/utils/helper';
import { getChunkById } from './ChunkRepository';
const { db } = app;

export async function getChunkOutput(id: Chunk['id']) {
    const chunk = await getChunkById(id).run(db);

    if (chunk) {
        return await readFilePromise(pathResolve(CHUNK_OUTPUT_SAVE_PATH, chunk.id));
    } else {
        throw new NotFoundError('Chunk not found');
    }
}
