import { Role } from '@/types/enums';

export class UserLoginResponse {
    id: number;

    email: string;

    role: Role;
}
