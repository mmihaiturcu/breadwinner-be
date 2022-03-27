import { BadRequestError, Controller, Post, Req, UseAfter, UseBefore } from 'routing-controllers';
import app from '@/config/App.js';
import { STRIPE_WEBHOOK_SECRET } from '@/utils/constants.js';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { authenticationMiddleware, csrfMiddleware, loggingMiddleware } from '@/middleware/index.js';
import {
    createPaymentForUnattachedPayloads,
    getOngoingSessionCheckoutLink,
} from './PaymentService.js';
import { PaymentStates } from '@/types/enums/PaymentStates.js';

const { dataProcessorRepository, stripe, payloadRepository, paymentRepository } = app;

export async function handleWebhookEvent(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log('error', err);
        throw new BadRequestError(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'account.external_account.created':
        case 'account.updated': {
            const account: Stripe.Account = event.data.object as Stripe.Account;
            if (account.charges_enabled) {
                const dataProcessor = await dataProcessorRepository.findById(
                    Number(account.metadata.id)
                );
                dataProcessor.activatedStripeAccount = true;
                await dataProcessorRepository.save(dataProcessor);
            }
            break;
        }
        case 'checkout.session.completed': {
            const session: Stripe.Checkout.Session = event.data.object as Stripe.Checkout.Session;
            const payload = await payloadRepository.getPaymentByPayloadId(
                Number(session.metadata.payloadId)
            );
            payload.payment.paymentState = PaymentStates.PAID;
            await paymentRepository.save(payload.payment);
            break;
        }

        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({
        received: true,
    });
}

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/payment')
export class PaymentController {
    @UseBefore(csrfMiddleware)
    @Post('/createPaymentForUnattachedPayloads')
    async createPaymentForUnattachedPayloads(@Req() req) {
        return await createPaymentForUnattachedPayloads(
            req.session.user.id,
            req.session.user.email
        );
    }

    @UseBefore(csrfMiddleware)
    @Post('/getCheckoutLink')
    async getCheckoutLink(@Req() req) {
        return await getOngoingSessionCheckoutLink(req.session.user.id);
    }
}
