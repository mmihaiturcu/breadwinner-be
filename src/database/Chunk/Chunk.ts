import { FileResource, Payload } from '@/database/models/index.js';
import { Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chunk {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Payload)
    payload: Payload;

    @OneToOne(() => FileResource)
    inputFile: FileResource;

    @OneToOne(() => FileResource)
    outputFile: FileResource;
}
