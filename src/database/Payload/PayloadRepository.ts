import { ChunkDTO, JSONSchema } from '@/types/models';
import queryBuilder from 'dbschema/edgeql-js/index';
import { addChunk } from '../Chunk/ChunkRepository';
import { DataSupplier, Payload } from '../models';
import { getDataSupplierById } from '../User/UserRepository';

export function addPayload({
    label,
    jsonSchema,
    hasRelinKeys,
    hasGaloisKeys,
    dataSupplierId,
    chunks,
}: {
    label: Payload['label'];
    jsonSchema: JSONSchema;
    hasRelinKeys: Payload['hasRelinKeys'];
    hasGaloisKeys: Payload['hasGaloisKeys'];
    dataSupplierId: DataSupplier['id'];
    chunks: ChunkDTO[];
}) {
    return queryBuilder.insert(queryBuilder.Payload, {
        label,
        jsonSchema: queryBuilder.json(jsonSchema),
        hasRelinKeys,
        hasGaloisKeys,
        dataSupplier: getDataSupplierById(dataSupplierId),
        chunks: queryBuilder.set(...chunks.map((chunkDTO) => addChunk(chunkDTO.length))),
    });
}

export function getPayloadChunkIds(id: Payload['id']) {
    return queryBuilder.select(queryBuilder.Payload, (payload) => ({
        filter: queryBuilder.op(payload.id, '=', queryBuilder.uuid(id)),
        chunks: {
            id: true,
        },
    }));
}

export function getDataSupplierPayloads(id: DataSupplier['id']) {
    return queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
        filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(id)),
        payloads: {
            id: true,
            label: true,
            chunks: {
                id: true,
                length: true,
                processed: true,
            },
        },
    }));
}

export function getPayloadDecryptInfo(id: Payload['id']) {
    return queryBuilder.select(queryBuilder.Payload, (payload) => ({
        filter: queryBuilder.op(payload.id, '=', queryBuilder.uuid(id)),
        jsonSchema: true,
        chunks: {
            id: true,
            length: true,
        },
    }));
}

export function markPayloadAsPaid(id: Payload['id']) {
    return queryBuilder.update(queryBuilder.Payload, (payload) => ({
        filter: queryBuilder.op(payload.id, '=', queryBuilder.uuid(id)),
        set: {
            payment: queryBuilder.update(payload.payment, () => ({
                set: {
                    paymentState: queryBuilder.PaymentState.PAID,
                },
            })),
        },
    }));
}
