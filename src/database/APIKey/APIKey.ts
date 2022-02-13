import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DataProcessor } from '../DataProcessor/DataProcessor.js';

@Entity()
export class APIKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    prefix: string;

    /**
     * 32 Character long alphanumeric string, which is hashed using SHA512
     */
    @Column()
    hash: string;

    @Column()
    hostname: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => DataProcessor)
    dataProcessor: DataProcessor;

    constructor(prefix: APIKey['prefix'], hash: APIKey['hash'], hostname: APIKey['hostname']) {
        this.prefix = prefix;
        this.hash = hash;
        this.hostname = hostname;
    }
}
