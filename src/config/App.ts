import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sessionMiddleware } from '@/middleware/index';
import Stripe from 'stripe';
import { Client, createClient } from 'edgedb';

class App {
    public static app: App;
    public expressApp!: express.Application;
    public db!: Client;
    public stripe!: Stripe;

    private constructor() {
        //
    }

    private static configureExpressApp(): void {
        this.app.expressApp.use(sessionMiddleware);
        this.app.expressApp.use(express.urlencoded({ extended: true }));
        // Use JSON parser for all non-webhook routes
        this.app.expressApp.use((req, res, next) => {
            if (req.originalUrl === '/payment/webhook') {
                next();
            } else {
                express.json({ limit: '100mb' })(req, res, next); // To parse the incoming requests with JSON payloads
            }
        });
        this.app.expressApp.use(
            cors({
                origin: process.env.FRONTEND_URL,
                credentials: true,
            })
        );
        this.app.expressApp.use(helmet.hsts());
    }

    private static configureDB(): Client {
        return createClient({ dsn: process.env.DATABASE_DSN });
    }

    public static async getAppInstance(): Promise<App> {
        if (!this.app) {
            this.app = new App();
            this.app.expressApp = express();
            this.configureExpressApp();
            this.app.db = await this.configureDB();
            this.app.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2020-08-27',
            });
        }

        return this.app;
    }
}

export default await App.getAppInstance();
