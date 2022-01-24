import { User, APIKey } from '@/database/models/index.js';
import { BeforeInsert, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class DataProcessor {
    @PrimaryColumn()
    id: number;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'id' })
    userDetails: User;

    @OneToOne(() => APIKey, { cascade: true })
    apiKey: APIKey;

    constructor(userDetails: User) {
        this.userDetails = userDetails;
    }

    @BeforeInsert()
    mapsId() {
        this.id = this.userDetails.id;
    }
}
