import { User } from '@/database/models';
import { Matches, ValidateIf } from 'class-validator';

export class CreateApiKeyRequest {
    userId: User['id'];

    @ValidateIf((o: CreateApiKeyRequest) => o.hostname !== 'localhost')
    @Matches(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/)
    hostname: string;
}
