import { Chunk, Payload } from '@/database/models';
import { JSONSchema } from './JSONSchema';

export interface PayloadToProcess {
    id: Payload['id'];
    jsonSchema: JSONSchema;
    publicKey: Payload['publicKey'];
    chunks: Pick<Chunk, 'id' | 'length' | 'inputPath'>[];
}
