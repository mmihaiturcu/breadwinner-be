import { Payload, Chunk } from '@/database/models/index';
import { JSONSchema } from './JSONSchema';

export interface PayloadToProcessDTO {
    id: Payload['id'];
    jsonSchema: JSONSchema;
    chunk: {
        id: Chunk['id'];
        length: Chunk['length'];
        columnsData: string;
    };
    publicKey: string;
    galoisKeys: string;
    relinKeys: string;
}
