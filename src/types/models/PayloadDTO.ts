import { User } from '@/database/models';
import { ChunkDTO, JSONSchema } from '.';

export interface PayloadDTO {
    userId: User['id'];
    chunks: ChunkDTO[];
    jsonSchema: JSONSchema;
    publicKey: string;
}
