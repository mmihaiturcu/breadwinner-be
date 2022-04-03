import { User } from '@/database/models/index';

export class UserDetails {
    id!: User['id'];
    roleSpecificId!: User['id'];
    email!: User['email'];
    role!: User['role'];
}
