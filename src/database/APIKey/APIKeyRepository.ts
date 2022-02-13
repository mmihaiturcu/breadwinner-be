import { ApiKeyDto } from '@/types/models/ApiKeyDto.js';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../User/User.js';
import { APIKey } from './APIKey.js';

@EntityRepository(APIKey)
export class APIKeyRepository extends Repository<APIKey> {
    findByHash(hash: APIKey['hash']) {
        return this.findOne({ hash });
    }
    async getApiKeysByUserId(userId: User['id']): Promise<ApiKeyDto[]> {
        return await this.find({
            select: ['prefix', 'hostname', 'createdAt'],
            where: {
                dataProcessor: {
                    id: userId,
                },
            },
        });
    }
}
