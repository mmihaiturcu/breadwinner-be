import { Chunk, JSONSchema } from '@database/models/index.js';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payload {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => JSONSchema)
    jsonSchema: JSONSchema;

    @OneToMany(() => Chunk, (chunk) => chunk.payload)
    chunks: Chunk[];
}
