import app from '@/config/App.js';
import { PayloadDTO } from '@/types/models/PayloadDTO.js';
import { Chunk } from '../Chunk/Chunk.js';
import { User } from '../User/User.js';
import { Payload } from './Payload.js';
import { resolve } from 'path';
import { INPUT_SAVE_PATH, OUTPUT_SAVE_PATH } from '@/utils/constants.js';
import { appendFileSync, readFileSync } from 'fs';
import {
    ChunkProcessedEventData,
    JSONSchema,
    PayloadToProcess,
    PayloadToProcessDTO,
} from '@/types/models/index.js';
import { DecryptPayloadDTOResponse } from '@/types/payloads/responses/DecryptPayloadDTOResponse.js';

const payloadRepository = app.payloadRepository;
const chunkRepository = app.chunkRepository;
const dataSupplierRepository = app.dataSupplierRepository;

export async function createPayload(payloadDTO: PayloadDTO) {
    const dataSupplier = await dataSupplierRepository.findById(payloadDTO.userId);
    const payload = new Payload(
        payloadDTO.label,
        payloadDTO.jsonSchema,
        dataSupplier,
        payloadDTO.publicKey,
        payloadDTO.galoisKeys
    );
    const savedPayload = await payloadRepository.save(payload);

    const chunks = payloadDTO.chunks.map((chunk) => new Chunk(savedPayload, chunk.length));
    const savedChunks = await chunkRepository.save(chunks);
    savedChunks.forEach((chunk, index) => {
        const inputPath = resolve(INPUT_SAVE_PATH, `${chunk.id}`);
        const bytes = payloadDTO.chunks[index].cipherText;
        appendFileSync(inputPath, bytes);
        chunk.inputPath = inputPath;
    });
    chunkRepository.save(savedChunks);

    savedPayload.chunks = savedChunks;

    await payloadRepository.save(savedPayload);
}

export async function getPayloadsForUser(userId: User['id']) {
    const payloads = await payloadRepository.getPayloadsByUserId(userId);
    const initialValue = 0;

    return payloads.map((payload) => {
        return {
            id: payload.id,
            label: payload.label,
            noChunks: payload.chunks.length,
            totalDataLength: payload.chunks
                .map((chunk) => chunk.length)
                .reduce(
                    (previousValue, currentValue) => previousValue + currentValue,
                    initialValue
                ),
            progress:
                payload.chunks.filter((chunk) => chunk.processed).length / payload.chunks.length,
        };
    });
}

export async function getProcessingPayload(): Promise<PayloadToProcessDTO> {
    const payload = (await payloadRepository.getPayloadToProcess()) as unknown as PayloadToProcess;
    if (payload) {
        const chunk = payload.chunks[0];
        const loadedInput = readFileSync(chunk.inputPath, 'utf-8');
        return {
            id: payload.id,
            jsonSchema: payload.jsonSchema,
            publicKey: payload.publicKey,
            chunk: {
                id: chunk.id,
                length: chunk.length,
                input: loadedInput,
            },
            galoisKeys: payload.galoisKeys,
        };
    }
}

export async function saveChunkProcessingResult(data: ChunkProcessedEventData) {
    const chunk = await chunkRepository.findById(data.chunkId);

    const outputPath = resolve(OUTPUT_SAVE_PATH, `${chunk.id}`);
    appendFileSync(outputPath, data.result);
    chunk.outputPath = outputPath;
    chunk.processed = true;
    await chunkRepository.save(chunk);
}

export async function getDecryptInfoForPayload(
    id: Payload['id']
): Promise<DecryptPayloadDTOResponse> {
    const payload = (await payloadRepository.getPayloadDecryptInfo(id)) as unknown as {
        jsonSchema: JSONSchema;
        chunks: {
            id: Chunk['id'];
            length: Chunk['length'];
        }[];
    };

    return {
        endResultType:
            payload.jsonSchema.operations[payload.jsonSchema.operations.length - 1].resultType,
        chunks: payload.chunks,
    };
}
