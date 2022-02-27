import app from '@/config/App.js';
import { PayloadDTO } from '@/types/models/PayloadDTO.js';
import { Chunk } from '../Chunk/Chunk.js';
import { User } from '../User/User.js';
import { Payload } from './Payload.js';

const payloadRepository = app.payloadRepository;
const chunkRepository = app.chunkRepository;
const dataSupplierRepository = app.dataSupplierRepository;

export async function createPayload(payloadDTO: PayloadDTO) {
    const dataSupplier = await dataSupplierRepository.findById(payloadDTO.userId);
    const payload = new Payload(payloadDTO.jsonSchema, dataSupplier);
    const savedPayload = await payloadRepository.save(payload);
    const chunks = payloadDTO.chunks.map(
        (chunk) => new Chunk(savedPayload, chunk.length, chunk.cipherText)
    );

    const savedChunks = await chunkRepository.save(chunks);
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

export async function getProcessingPayload() {
    const payload = await payloadRepository.getPayloadToProcess();

    return payload;
}
