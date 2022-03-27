import { PaymentStates } from '@/types/enums/index.js';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { DataSupplier } from '../DataSupplier/DataSupplier.js';
import { Payload } from '../Payload/Payload.js';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DataSupplier)
    @JoinColumn()
    dataSupplier: DataSupplier;

    @OneToMany(() => Payload, (payload) => payload.payment)
    payloads: Payload[];

    @Column()
    stripeSessionID: string;

    @Column()
    stripeCheckoutURL: string;

    @Column()
    paymentState: PaymentStates;

    @CreateDateColumn()
    createdAt: Date;

    constructor(dataSupplier: DataSupplier, stripeSessionID: string, checkoutURL: string) {
        this.dataSupplier = dataSupplier;
        this.stripeSessionID = stripeSessionID;
        this.paymentState = PaymentStates.PENDING;
        this.stripeCheckoutURL = checkoutURL;
    }
}
