import { BadRequestError, Controller, Post, Req, UseAfter, UseBefore } from 'routing-controllers';
import app from '@/config/App';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { authenticationMiddleware, csrfMiddleware, loggingMiddleware } from '@/middleware/index';
import {
    createPaymentForUnattachedPayloads,
    getOngoingSessionCheckoutLink,
} from './PaymentService';
import { markDataProcessorActivatedStripeAccount } from '../User/UserRepository';
import { markPayloadAsPaid } from '../Payload/PayloadRepository';
const { db, stripe } = app;

export async function handleWebhookEvent(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    if (sig) {
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log('error', err);
            throw new BadRequestError(`Invalid signature`);
        }

        // Handle the event
        switch (event.type) {
            case 'account.external_account.created':
            case 'account.updated': {
                const account: Stripe.Account = event.data.object as Stripe.Account;
                if (account.charges_enabled) {
                    await markDataProcessorActivatedStripeAccount(account.metadata!.id).run(db);
                }
                break;
            }
            case 'checkout.session.completed': {
                const session: Stripe.Checkout.Session = event.data
                    .object as Stripe.Checkout.Session;
                await markPayloadAsPaid(session.metadata!.payloadId).run(db);
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
}

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/payment')
export class PaymentController {
    @UseBefore(csrfMiddleware)
    @Post('/createPaymentForUnattachedPayloads')
    async createPaymentForUnattachedPayloads(@Req() req: Request) {
        return await createPaymentForUnattachedPayloads(
            req.session.user!.roleSpecificId,
            req.session.user!.email
        );
    }

    @UseBefore(csrfMiddleware)
    @Post('/getCheckoutLink')
    async getCheckoutLink(@Req() req: Request) {
        return await getOngoingSessionCheckoutLink(req.session.user!.roleSpecificId);
    }
}
