import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/index.js';
import { Payload } from './Payload.js';

@EntityRepository(Payload)
export class PayloadRepository extends Repository<Payload> {
    findById(id: Payload['id']) {
        return this.findOne({ id });
    }

    async getPayloadsByUserId(userId: User['id']): Promise<Payload[]> {
        return await this.createQueryBuilder('payload')
            .leftJoinAndSelect('payload.chunks', 'chunk')
            .leftJoin('payload.dataSupplier', 'dataSupplier')
            .select(['payload.id', 'chunk.processed', 'chunk.length'])
            .where('dataSupplier.id = :dataSupplierId', { dataSupplierId: userId })
            .getMany();
    }

    async getPayloadToProcess(): Promise<Payload> {
        return await this.createQueryBuilder('payload')
            .leftJoinAndSelect('payload.chunks', 'chunk')
            .select(['payload.id', 'payload.jsonSchema', 'chunk.id', 'chunk.length', 'chunk.input'])
            .where(`chunk.processed = 'f'`)
            .limit(1)
            .getOne();
    }
}
