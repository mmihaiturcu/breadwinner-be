import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

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

    constructor(prefix: APIKey['prefix'], hash: APIKey['hash'], hostname: APIKey['hostname']) {
        this.prefix = prefix;
        this.hash = hash;
        this.hostname = hostname;
    }
}
