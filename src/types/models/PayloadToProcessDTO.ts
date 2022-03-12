import { JSONSchema } from './JSONSchema';

export interface PayloadToProcessDTO {
    id: number;
    jsonSchema: JSONSchema;
    chunk: {
        id: number;
        length: number;
        columnsData: string;
    };
    publicKey: string;
    galoisKeys: string;
    relinKeys: string;
}
