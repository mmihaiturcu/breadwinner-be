import { Chunk, DataSupplier } from '@/database/models/index.js';
import { JSONSchema } from '@/types/models';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Dataset which a DataSupplier uploads, which is to be processed in a specific way as indicated by its associated JSONSchema.
 * It is formed of multiple (encrypted) chunks, each containing a set amount of data (details such as number of rows in each Chunk, operations etc. are stored in JSONSchema).
 */
@Entity()
export class Payload {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;

    @Column()
    publicKey: string;

    @Column('json')
    jsonSchema: JSONSchema;

    @ManyToOne(() => DataSupplier)
    dataSupplier: DataSupplier;

    @OneToMany(() => Chunk, (chunk) => chunk.payload)
    chunks: Chunk[];

    constructor(
        label: string,
        jsonSchema: JSONSchema,
        dataSupplier: DataSupplier,
        publicKey: string
    ) {
        this.label = label;
        this.jsonSchema = jsonSchema;
        this.dataSupplier = dataSupplier;
        this.publicKey = publicKey;
    }
}
