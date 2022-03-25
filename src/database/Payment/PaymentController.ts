import { BadRequestError, Controller, Post, Req } from 'routing-controllers';
import app from '@/config/App.js';
import { STRIPE_WEBHOOK_SECRET } from '@/utils/constants.js';
import Stripe from 'stripe';
import { Request, Response } from 'express';

const dataProcessorRepository = app.dataProcessorRepository;

export async function handleWebhookEvent(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        event = app.stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
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

        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({
        received: true,
    });
}
