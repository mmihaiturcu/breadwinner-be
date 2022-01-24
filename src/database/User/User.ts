import { Role } from '@/types/enums';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @Column()
    role: Role;

    constructor(email: User['email']) {
        this.email = email;
    }
}
