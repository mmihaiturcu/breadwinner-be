import { Payload, User } from '@/database/models/index.js';
import { BeforeInsert, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class DataSupplier {
    @PrimaryColumn()
    id: number;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'id' })
    userDetails: User;

    @OneToMany(() => Payload, (payload) => payload.dataSupplier)
    payloads: Payload[];

    constructor(User: User) {
        this.userDetails = User;
    }

    @BeforeInsert()
    mapsId() {
        this.id = this.userDetails.id;
    }
}
