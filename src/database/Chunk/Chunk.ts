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

    @Column('bytea')
    input: Uint8Array;

    @Column({ type: 'bytea', nullable: true })
    output: Uint8Array;

    @Column()
    processed: boolean;

    constructor(payload: Chunk['payload'], length: Chunk['length'], input: Chunk['input']) {
        this.payload = payload;
        this.length = length;
        this.input = input;
        this.processed = false;
    }
}
