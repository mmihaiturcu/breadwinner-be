import { User } from '@/database/models/index.js';
import { APIKey } from '../APIKey/APIKey.js';
import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';

@Entity()
export class DataProcessor {
    @PrimaryColumn()
    id: number;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'id' })
    userDetails: User;

    @OneToMany(() => APIKey, (apiKey) => apiKey.dataProcessor)
    apiKeys: APIKey[];

    @Column()
    activatedStripeAccount: boolean;

    @Column({ nullable: true })
    connectedStripeAccountID: string;

    constructor(userDetails: User) {
        this.userDetails = userDetails;
        this.activatedStripeAccount = false;
    }

    @BeforeInsert()
    mapsId() {
        this.id = this.userDetails.id;
    }
}
