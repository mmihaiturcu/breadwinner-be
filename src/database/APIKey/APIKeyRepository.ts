import { EntityRepository, Repository } from 'typeorm';
import { APIKey } from './APIKey.js';

@EntityRepository(APIKey)
export class APIKeyRepository extends Repository<APIKey> {
    findByHash(hash: APIKey['hash']) {
        return this.findOne({ hash });
    }
}
