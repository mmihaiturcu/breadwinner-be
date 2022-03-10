import { JSONSchema } from './JSONSchema';

export interface PayloadToProcessDTO {
    id: number;
    jsonSchema: JSONSchema;
    chunk: {
        id: number;
        length: number;
        input: string;
    };
    publicKey: string;
    galoisKeys: string;
}
