import { DataSupplier, FileResource, Payload } from '@database/models/index.js';
import { Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JSONSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DataSupplier)
    dataSupplier: DataSupplier;

    @OneToOne(() => FileResource)
    fileResource: FileResource;

    @OneToMany(() => Payload, (payload) => payload.jsonSchema)
    payloads: Payload[];
}
