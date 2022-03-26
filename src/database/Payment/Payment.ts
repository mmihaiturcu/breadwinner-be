import { PaymentStates } from '@/types/enums/index.js';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DataSupplier } from '../DataSupplier/DataSupplier.js';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DataSupplier)
    @JoinColumn()
    dataSupplier: DataSupplier;

    @Column()
    stripeSessionID: string;

    @Column()
    stripeCheckoutURL: string;

    @Column()
    paymentState: PaymentStates;

    constructor(dataSupplier: DataSupplier, stripeSessionID: string, checkoutURL: string) {
        this.dataSupplier = dataSupplier;
        this.stripeSessionID = stripeSessionID;
        this.paymentState = PaymentStates.PENDING;
        this.stripeCheckoutURL = checkoutURL;
    }
}
