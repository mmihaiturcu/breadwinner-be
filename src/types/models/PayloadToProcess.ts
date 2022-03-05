import { FileResource } from '@/database/models';
import { JSONSchema } from './JSONSchema';

export interface PayloadToProcess {
    id: number;
    jsonSchema: JSONSchema;
    publicKey: string;
    chunks: {
        id: number;
        length: number;
        input: string;
    }[];
}
