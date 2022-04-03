import { Chunk, Payload } from '@/database/models/index';
import { JSONSchema } from './JSONSchema';

export interface PayloadToProcess {
    id: Payload['id'];
    jsonSchema: JSONSchema;
    publicKey: string;
    galoisKeys: string;
    relinKeys: string;
    chunks: Pick<Chunk, 'id' | 'length'>[];
}
