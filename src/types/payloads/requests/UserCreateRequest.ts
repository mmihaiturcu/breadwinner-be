import { Role } from '@/database/models/index';
import { IsEmail, IsIn } from 'class-validator';

export class UserCreateRequest {
    @IsEmail()
    email!: string;

    @IsIn([Role.DATA_SUPPLIER, Role.DATA_PROCESSOR])
    userRole!: Role.DATA_SUPPLIER | Role.DATA_PROCESSOR;
}
