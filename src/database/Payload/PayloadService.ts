import app from '@/config/App.js';
import { PayloadDTO } from '@/types/models/PayloadDTO.js';
import { Chunk } from '../Chunk/Chunk.js';
import { User } from '../User/User.js';
import { Payload } from './Payload.js';
import { resolve } from 'path';
import { INPUT_SAVE_PATH } from '@/utils/constants.js';
import { appendFileSync, readFileSync } from 'fs';
import { PayloadToProcess, PayloadToProcessDTO } from '@/types/models/index.js';

const payloadRepository = app.payloadRepository;
const chunkRepository = app.chunkRepository;
const dataSupplierRepository = app.dataSupplierRepository;

export async function createPayload(payloadDTO: PayloadDTO) {
    const dataSupplier = await dataSupplierRepository.findById(payloadDTO.userId);
    const payload = new Payload(payloadDTO.jsonSchema, dataSupplier, payloadDTO.publicKey);
    const savedPayload = await payloadRepository.save(payload);

    const chunks = payloadDTO.chunks.map((chunk) => new Chunk(savedPayload, chunk.length));
    const savedChunks = await chunkRepository.save(chunks);
    savedChunks.forEach((chunk, index) => {
        const inputPath = resolve(INPUT_SAVE_PATH, `${chunk.id}`);
        const bytes = payloadDTO.chunks[index].cipherText;
        appendFileSync(inputPath, bytes);
        chunk.input = inputPath;
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
    const loadedInput = readFileSync(payload.chunks[0].input, 'utf-8');

    return {
        id: payload.id,
        jsonSchema: payload.jsonSchema,
        publicKey: payload.publicKey,
        chunk: {
            ...payload.chunks[0],
            input: loadedInput,
        },
    };
}
