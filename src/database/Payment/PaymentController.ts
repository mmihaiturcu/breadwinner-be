import { BadRequestError, Controller, Post, Req, UseAfter, UseBefore } from 'routing-controllers';
import app from '@/config/App';
import { STRIPE_WEBHOOK_SECRET } from '@/utils/constants';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { authenticationMiddleware, csrfMiddleware, loggingMiddleware } from '@/middleware/index';
import {
    createPaymentForUnattachedPayloads,
    getOngoingSessionCheckoutLink,
} from './PaymentService';
import queryBuilder from 'dbschema/edgeql-js/index';
const { db, stripe } = app;

export async function handleWebhookEvent(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    if (sig) {
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
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
                    await queryBuilder
                        .update(queryBuilder.DataProcessor, (dataProcessor) => ({
                            filter: queryBuilder.op(
                                dataProcessor.id,
                                '=',
                                queryBuilder.uuid(account.metadata!.id)
                            ),
                            set: {
                                activatedStripeAccount: true,
                            },
                        }))
                        .run(db);
                }
                break;
            }
            case 'checkout.session.completed': {
                const session: Stripe.Checkout.Session = event.data
                    .object as Stripe.Checkout.Session;
                await queryBuilder
                    .update(queryBuilder.Payload, (payload) => ({
                        filter: queryBuilder.op(
                            payload.id,
                            '=',
                            queryBuilder.uuid(session.metadata!.payloadId)
                        ),
                        set: {
                            payment: queryBuilder.update(payload.payment, () => ({
                                set: {
                                    paymentState: queryBuilder.PaymentState.PAID,
                                },
                            })),
                        },
                    }))
                    .run(db);
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
