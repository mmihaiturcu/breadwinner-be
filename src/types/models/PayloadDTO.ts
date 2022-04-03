import { ArrayMinSize, IsArray, IsBase64, IsObject, IsOptional, MinLength } from 'class-validator';
import { ChunkDTO, JSONSchema } from '.';

export class PayloadDTO {
    @IsArray()
    @ArrayMinSize(1)
    chunks!: ChunkDTO[];

    @IsObject()
    jsonSchema!: JSONSchema;

    @MinLength(1)
    label!: string;

    @IsBase64()
    publicKey!: string;

    @IsOptional()
    @IsBase64()
    galoisKeys?: string;

    @IsOptional()
    @IsBase64()
    relinKeys?: string;
}
