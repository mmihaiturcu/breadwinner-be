import { Chunk, DataProcessor } from '../models';
import queryBuilder from 'dbschema/edgeql-js/index';

export function getChunkById(id: Chunk['id']) {
    return queryBuilder.select(queryBuilder.Chunk, (chunk) => ({
        filter: queryBuilder.op(chunk.id, '=', queryBuilder.uuid(id)),
        id: true,
    }));
}

export function addChunk(length: Chunk['length']) {
    return queryBuilder.insert(queryBuilder.Chunk, {
        length,
        paidFor: false,
        processed: false,
    });
}

export function getChunkToProcess() {
    return queryBuilder.select(queryBuilder.Chunk, (chunk) => ({
        filter: queryBuilder.op(
            queryBuilder.op(chunk.processed, '=', false),
            'and',
            queryBuilder.op(chunk.payload.payment.paymentState, '=', queryBuilder.PaymentState.PAID)
        ),
        limit: 1,
        id: true,
        length: true,
        payload: {
            id: true,
            jsonSchema: true,
            hasGaloisKeys: true,
            hasRelinKeys: true,
        },
    }));
}

export function saveChunkOutput({
    chunkId,
    dataProcessorId,
}: {
    chunkId: Chunk['id'];
    dataProcessorId: DataProcessor['id'];
}) {
    return queryBuilder.update(queryBuilder.Chunk, (chunk) => ({
        filter: queryBuilder.op(
            queryBuilder.op(chunk.id, '=', queryBuilder.uuid(chunkId)),
            'and',
            queryBuilder.op(chunk.processed, '=', false)
        ),
        set: {
            dataProcessor: queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
                filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(dataProcessorId)),
            })),
            processed: true,
        },
    }));
}

export function deleteChunks(chunkIds: Chunk['id'][]) {
    return queryBuilder.delete(queryBuilder.Chunk, (chunk) => ({
        filter: queryBuilder.op(
            chunk.id,
            'in',
            queryBuilder.set(...chunkIds.map((id) => queryBuilder.uuid(id)))
        ),
    }));
}

export function markChunksAsPaid(chunks: { id: Chunk['id'] }[]) {
    return queryBuilder.update(queryBuilder.Chunk, (chunk) => ({
        filter: queryBuilder.op(
            chunk.id,
            'in',
            queryBuilder.set(...chunks.map((chunk) => queryBuilder.uuid(chunk.id)))
        ),
        set: {
            paidFor: true,
        },
    }));
}
