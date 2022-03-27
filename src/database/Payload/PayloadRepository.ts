import { UnattachedPayload } from '@/types/models/index.js';
import { EntityRepository, In, Repository } from 'typeorm';
import { User, DataSupplier, Chunk } from '../models/index.js';
import { Payload } from './Payload.js';
import { Payment } from '../Payment/Payment.js';
import { PaymentStates } from '@/types/enums/PaymentStates.js';

@EntityRepository(Payload)
export class PayloadRepository extends Repository<Payload> {
    findById(id: Payload['id']) {
        return this.findOne({ id });
    }

    async getPayloadsByUserId(userId: User['id']): Promise<Payload[]> {
        return await this.createQueryBuilder('payload')
            .leftJoinAndSelect('payload.chunks', 'chunk')
            .leftJoin('payload.dataSupplier', 'dataSupplier')
            .select(['payload.id', 'payload.label', 'chunk.processed', 'chunk.length'])
            .where('dataSupplier.id = :dataSupplierId', { dataSupplierId: userId })
            .getMany();
    }

    async getPayloadToProcess() {
        return await this.createQueryBuilder('payload')
            .leftJoinAndSelect('payload.chunks', 'chunk')
            .leftJoinAndSelect('payload.payment', 'payment')
            .select([
                'payload.id',
                'payload.jsonSchema',
                'payload.publicKey',
                'payload.galoisKeys',
                'payload.relinKeys',
                'chunk.id',
                'chunk.length',
                'chunk.inputPath',
            ])
            .where(`payment IS NOT NULL AND payment.paymentState = 1 AND chunk.processed = 'f'`)
            .limit(1)
            .getOne();
    }

    async getPayloadDecryptInfo(id: Payload['id']) {
        return await this.createQueryBuilder('payload')
            .leftJoinAndSelect('payload.chunks', 'chunk')
            .select(['payload.jsonSchema', 'chunk.id', 'chunk.length'])
            .where(`payload.id = :id`, { id })
            .orderBy('chunk.id', 'ASC')
            .getOne();
    }

    async getUnattachedPayloads(dataSupplierId: DataSupplier['id']): Promise<UnattachedPayload[]> {
        return (await this.createQueryBuilder('payload')
            .leftJoinAndSelect('payload.chunks', 'chunks')
            .leftJoinAndSelect('payload.dataSupplier', 'dataSupplier')
            .select(['payload.jsonSchema', 'payload.id'])
            .loadRelationCountAndMap('payload.noChunks', 'payload.chunks')
            .where(`payload.payment IS NULL AND dataSupplier.id = :dataSupplierId`, {
                dataSupplierId,
            })
            .getMany()) as unknown as UnattachedPayload[];
    }

    async updatePayloadsPayment(payloadIds: Payload['id'][], payment: Payment) {
        return await this.update(
            {
                id: In(payloadIds),
            },
            { payment }
        );
    }

    async getPaymentByPayloadId(payloadId: Payload['id']): Promise<{ payment: Payment }> {
        return await this.findOne(
            { id: payloadId },
            {
                relations: ['payment'],
                select: ['id', 'payment'],
            }
        );
    }
}
