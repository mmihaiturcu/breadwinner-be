import { PaymentStates } from '@/types/enums/PaymentStates.js';
import { EntityRepository, Repository } from 'typeorm';
import { DataSupplier } from '../DataSupplier/DataSupplier.js';
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
}
