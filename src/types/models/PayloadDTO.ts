import { User } from '@/database/models';
import { ArrayMinSize, IsArray, IsBase64, IsObject, MinLength } from 'class-validator';
import { ChunkDTO, JSONSchema } from '.';

export class PayloadDTO {
    userId: User['id'];

    @IsArray()
    @ArrayMinSize(1)
    chunks: ChunkDTO[];

    @IsObject()
    jsonSchema: JSONSchema;

    @MinLength(1)
    label: string;

    @IsBase64()
    publicKey: string;
}
