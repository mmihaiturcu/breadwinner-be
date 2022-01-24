import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UserLoginRequest {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)
    password: string;
}
