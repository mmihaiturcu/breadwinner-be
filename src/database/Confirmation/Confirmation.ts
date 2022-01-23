import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../models';

@Entity()
export class Confirmation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    uuid: string;

    @Column()
    wasUsed: boolean;

    @Column()
    expiresAt: Date;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    constructor(uuid: string, expiresAt: Date, user: User) {
        this.uuid = uuid;
        this.expiresAt = expiresAt;
        this.user = user;
        this.wasUsed = false;
    }
}
