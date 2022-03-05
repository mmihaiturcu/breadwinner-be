import { JSONSchema } from './JSONSchema';

export interface PayloadToProcessDTO {
    id: number;
    jsonSchema: JSONSchema;
    publicKey: string;
    chunk: {
        id: number;
        length: number;
        input: string;
    };
}
