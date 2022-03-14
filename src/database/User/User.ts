import { Role } from '@/types/enums/index.js';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text', {
        nullable: true,
    })
    password: string;

    @Column('text', {
        nullable: true,
    })
    salt: string;

    @Column('text', {
        nullable: true,
    })
    otpSecret?: string;

    @Column()
    role: Role;

    constructor(email: User['email'], role: User['role']) {
        this.email = email;
        this.role = role;
    }
}
