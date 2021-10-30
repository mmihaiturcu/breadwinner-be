import { ApplicationUser, APIKey } from '@database/models/index.js';
import { Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataProcessor {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => ApplicationUser, { primary: true, cascade: true })
    userDetails: ApplicationUser;

    @OneToOne(() => APIKey, { primary: true, cascade: true })
    apiKey: APIKey;
}
