import { IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class UserFinishRequest {
    @IsUUID(4)
    confirmationUuid: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)
    password: string;
}
