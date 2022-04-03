import app from '@/config/App';
import { Chunk } from '../models';
import queryBuilder from 'dbschema/edgeql-js/index';
import { resolve as pathResolve } from 'path';
import { CHUNK_OUTPUT_SAVE_PATH } from '@/utils/constants';
import { NotFoundError } from 'routing-controllers';
import { readFilePromise } from '@/utils/helper';
const { db } = app;

export async function getChunkOutput(id: Chunk['id']) {
    const chunk = await queryBuilder
        .select(queryBuilder.Chunk, (chunk) => ({
            filter: queryBuilder.op(chunk.id, '=', queryBuilder.uuid(id)),
            id: true,
        }))
        .run(db);

    if (chunk) {
        return await readFilePromise(pathResolve(CHUNK_OUTPUT_SAVE_PATH, chunk.id));
    } else {
        throw new NotFoundError('Chunk not found');
    }
}
