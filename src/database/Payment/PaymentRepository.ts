import { PaymentStates } from '@/types/enums/PaymentStates.js';
import { EntityRepository, Repository } from 'typeorm';
import { DataSupplier } from '../DataSupplier/DataSupplier.js';
import { Payload } from '../Payload/Payload.js';
import { Payment } from './Payment.js';

@EntityRepository(Payment)
export class PaymentRepository extends Repository<Payment> {
    async getOngoingPayment(
        dataSupplierId: DataSupplier['id']
    ): Promise<{ stripeCheckoutURL: string } | null> {
        return this.findOne({
            select: ['stripeCheckoutURL'],
            where: {
                dataSupplier: {
                    id: dataSupplierId,
                },
                paymentState: PaymentStates.PENDING,
            },
        });
    }

    async getPendingPaymentsOlderThanAnHour(): Promise<
        {
            id: number;
            stripeSessionID: string;
            payloads: (Pick<Payload, 'id'> & { chunks: { id: number }[] })[];
        }[]
    > {
        return (await this.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.payloads', 'payload')
            .leftJoinAndSelect('payload.chunks', 'chunk')
            .select(['payment.id', 'payment.stripeSessionID', 'payload.id', 'chunk.id'])
            .where(
                `payment.paymentState = :pendingPaymentState AND payment.createdAt < now()-'1 hour'::interval`,
                {
                    pendingPaymentState: PaymentStates.PENDING,
                }
            )
            .getMany()) as unknown as {
            id: number;
            stripeSessionID: string;
            payloads: (Pick<Payload, 'id'> & { chunks: { id: number }[] })[];
        }[];
    }
}
