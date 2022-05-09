import app from '@/config/App';
import { PayloadDTO } from '@/types/models/PayloadDTO';
import { resolve } from 'path';
import {
    CHUNK_INPUT_SAVE_PATH,
    CHUNK_OUTPUT_SAVE_PATH,
    GALOIS_KEYS_SAVE_PATH,
    PUBLIC_KEYS_SAVE_PATH,
    RELIN_KEYS_SAVE_PATH,
} from '@/utils/constants';
import { ChunkProcessedEventData, JSONSchema, PayloadToProcessDTO } from '@/types/models/index';
import { DecryptPayloadDTOResponse } from '@/types/payloads/responses/DecryptPayloadDTOResponse';
import { NotFoundError } from 'routing-controllers';
import { User, DataProcessor, Payload } from '../models/index';
import queryBuilder from 'dbschema/edgeql-js/index';
import { readFilePromise, writeFilePromise } from '@/utils/helper';
const { db } = app;

export async function createPayload(userId: User['id'], payloadDTO: PayloadDTO) {
    try {
        const hasRelinKeys = typeof payloadDTO.relinKeys !== 'undefined';
        const hasGaloisKeys = typeof payloadDTO.galoisKeys !== 'undefined';

        const savedPayload = await queryBuilder
            .insert(queryBuilder.Payload, {
                label: payloadDTO.label,
                jsonSchema: queryBuilder.json(payloadDTO.jsonSchema),
                hasRelinKeys,
                hasGaloisKeys,
                dataSupplier: queryBuilder.select(queryBuilder.DataSupplier, (dataSupplier) => ({
                    filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(userId)),
                    id: true,
                })),
                chunks: queryBuilder.set(
                    ...payloadDTO.chunks.map((chunkDTO) =>
                        queryBuilder.insert(queryBuilder.Chunk, {
                            length: chunkDTO.length,
                            paidFor: false,
                            processed: false,
                        })
                    )
                ),
            })
            .run(db);

        console.log('saved payload');

        const chunkIds = await queryBuilder
            .select(queryBuilder.Payload, (payload) => ({
                filter: queryBuilder.op(payload.id, '=', queryBuilder.uuid(savedPayload.id)),
                chunks: {
                    id: true,
                },
            }))
            .run(db);

        if (chunkIds) {
            const fileWritePromises: Promise<void>[] = [];

            chunkIds.chunks.forEach((chunk, index) => {
                const inputPath = resolve(CHUNK_INPUT_SAVE_PATH, `${chunk.id}`);
                const bytes = payloadDTO.chunks[index].cipherText;

                fileWritePromises.push(writeFilePromise(inputPath, JSON.stringify(bytes)));
            });

            // Save keys to disk
            fileWritePromises.push(
                writeFilePromise(
                    resolve(PUBLIC_KEYS_SAVE_PATH, savedPayload.id),
                    payloadDTO.publicKey
                )
            );

            if (hasRelinKeys) {
                fileWritePromises.push(
                    writeFilePromise(
                        resolve(RELIN_KEYS_SAVE_PATH, savedPayload.id),
                        payloadDTO.relinKeys!
                    )
                );
            }

            if (hasGaloisKeys) {
                fileWritePromises.push(
                    writeFilePromise(
                        resolve(GALOIS_KEYS_SAVE_PATH, savedPayload.id),
                        payloadDTO.galoisKeys!
                    )
                );
            }

            await Promise.all(fileWritePromises);
        }
    } catch (err) {
        console.error(err);
        throw new NotFoundError('User for which to create payload not found');
    }
}

export async function getPayloadsForUser(userId: User['id']) {
    const dataSupplier = await queryBuilder
        .select(queryBuilder.DataSupplier, (dataSupplier) => ({
            filter: queryBuilder.op(dataSupplier.id, '=', queryBuilder.uuid(userId)),
            payloads: {
                id: true,
                label: true,
                chunks: {
                    id: true,
                    length: true,
                    processed: true,
                },
            },
        }))
        .run(db);

    if (dataSupplier) {
        const payloads = dataSupplier.payloads;
        return payloads.map((payload) => {
            return {
                id: payload.id,
                label: payload.label,
                noChunks: payload.chunks.length,
                totalDataLength: payload.chunks
                    .map((chunk) => chunk.length)
                    .reduce((previousValue, currentValue) => previousValue + currentValue, 0),
                progress:
                    payload.chunks.filter((chunk) => chunk.processed).length /
                    payload.chunks.length,
            };
        });
    } else {
        throw new NotFoundError('Data supplier is missing');
    }
}

export async function getProcessingPayload(): Promise<PayloadToProcessDTO | void> {
    const chunks = await queryBuilder
        .select(queryBuilder.Chunk, (chunk) => ({
            filter: queryBuilder.op(
                queryBuilder.op(chunk.processed, '=', false),
                'and',
                queryBuilder.op(
                    chunk.payload.payment.paymentState,
                    '=',
                    queryBuilder.PaymentState.PAID
                )
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
        }))
        .run(db);
    if (chunks.length) {
        const chunk = chunks[0];
        const payload = chunk.payload;
        if (payload) {
            const filePromises: Promise<string>[] = [];

            filePromises.push(readFilePromise(resolve(CHUNK_INPUT_SAVE_PATH, chunk.id)));
            filePromises.push(readFilePromise(resolve(PUBLIC_KEYS_SAVE_PATH, payload.id)));

            if (payload.hasRelinKeys) {
                filePromises.push(readFilePromise(resolve(RELIN_KEYS_SAVE_PATH, payload.id)));
            }

            if (payload.hasGaloisKeys) {
                filePromises.push(readFilePromise(resolve(GALOIS_KEYS_SAVE_PATH, payload.id)));
            }

            const loadedFiles = await Promise.all(filePromises);

            const publicKey = loadedFiles[1];

            let relinKeys;
            let galoisKeys;
            if (payload.hasRelinKeys) {
                relinKeys = loadedFiles[2];
                galoisKeys = loadedFiles[3];
            } else {
                relinKeys = '';
                galoisKeys = loadedFiles[2];
            }

            return {
                id: payload.id,
                jsonSchema: payload.jsonSchema as unknown as JSONSchema,
                publicKey: publicKey,
                chunk: {
                    id: chunk.id,
                    length: chunk.length,
                    columnsData: loadedFiles[0],
                },
                relinKeys,
                galoisKeys,
            };
        }
    }
}

export async function saveChunkProcessingResult(
    dataProcessorId: DataProcessor['id'],
    data: ChunkProcessedEventData
) {
    // Update the chunk that was just processed
    const chunk = await queryBuilder
        .update(queryBuilder.Chunk, (chunk) => ({
            filter: queryBuilder.op(
                queryBuilder.op(chunk.id, '=', queryBuilder.uuid(data.chunkId)),
                'and',
                queryBuilder.op(chunk.processed, '=', false)
            ),
            set: {
                dataProcessor: queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
                    filter: queryBuilder.op(
                        dataProcessor.id,
                        '=',
                        queryBuilder.uuid(dataProcessorId)
                    ),
                })),
                processed: true,
            },
        }))
        .run(db);

    if (chunk) {
        console.log('saved chunk', chunk);
        const outputPath = resolve(CHUNK_OUTPUT_SAVE_PATH, `${chunk[0].id}`);
        return writeFilePromise(outputPath, data.result);
    }
}

export async function getDecryptInfoForPayload(
    id: Payload['id']
): Promise<DecryptPayloadDTOResponse> {
    const payload = await queryBuilder
        .select(queryBuilder.Payload, (payload) => ({
            filter: queryBuilder.op(payload.id, '=', queryBuilder.uuid(id)),
            jsonSchema: true,
            chunks: {
                id: true,
                length: true,
            },
        }))
        .run(db);

    if (payload) {
        const parsedJSONSchema = JSON.parse(payload.jsonSchema) as JSONSchema;

        return {
            endResultType:
                parsedJSONSchema.operations[parsedJSONSchema.operations.length - 1].resultType,
            schemeType: parsedJSONSchema.schemeType,
            chunks: payload.chunks,
        };
    } else {
        throw new NotFoundError('Payload could not be found');
    }
}
