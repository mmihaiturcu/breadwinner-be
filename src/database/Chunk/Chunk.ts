import { Payload } from '@/database/models/index.js';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chunk {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Payload)
    payload: Payload;

    @Column()
    length: number; // No. of elements in the cipherText array saved in inputFile

    @Column({ nullable: true })
    input: string;

    @Column({ nullable: true })
    output: string;

    @Column()
    processed: boolean;

    constructor(payload: Chunk['payload'], length: Chunk['length']) {
        this.payload = payload;
        this.length = length;
        this.processed = false;
    }
}
