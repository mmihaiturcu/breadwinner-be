import { DataProcessor, Payload } from '@/database/models/index.js';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chunk {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Payload)
    payload: Payload;

    @Column()
    length: number; // No. of elements in the cipherText array saved in inputFile

    @Column({ nullable: true })
    inputPath: string;

    @Column({ nullable: true })
    outputPath: string;

    @Column()
    processed: boolean;

    @ManyToOne(() => DataProcessor)
    @JoinColumn()
    dataProcessor: DataProcessor;

    constructor(payload: Chunk['payload'], length: Chunk['length']) {
        this.payload = payload;
        this.length = length;
        this.processed = false;
    }
}
