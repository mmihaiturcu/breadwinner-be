import { Chunk, Payload } from '@/database/models';
import { JSONSchema } from './JSONSchema';

export interface PayloadToProcess {
    id: Payload['id'];
    jsonSchema: JSONSchema;
    publicKey: Payload['publicKey'];
    galoisKeys: Payload['galoisKeys'];
    relinKeys: Payload['relinKeys'];
    chunks: Pick<Chunk, 'id' | 'length' | 'inputPath'>[];
}
