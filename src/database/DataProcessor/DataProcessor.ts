import { ApplicationUser, APIKey } from '@database/models/index.js';
import { Entity, OneToOne } from 'typeorm';

@Entity()
export class DataProcessor {
    @OneToOne(() => ApplicationUser, { primary: true, cascade: true })
    userDetails: ApplicationUser;

    @OneToOne(() => APIKey, { primary: true, cascade: true })
    apiKey: APIKey;
}
