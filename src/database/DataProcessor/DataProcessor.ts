import { User, APIKey } from '@/database/models/index.js';
import { Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataProcessor {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { primary: true, cascade: true })
    userDetails: User;

    @OneToOne(() => APIKey, { primary: true, cascade: true })
    apiKey: APIKey;

    constructor(userDetails: User) {
        this.userDetails = userDetails;
    }
}
