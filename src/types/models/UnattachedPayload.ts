import { Payload, Payment } from '@/database/models/index';
import { JSONSchema } from './JSONSchema';

export interface UnattachedPayload {
    id: Payload['id'];
    jsonSchema: JSONSchema;
    noChunks: number;
    payment: Payment;
}
