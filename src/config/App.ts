import { DB_PORT, FRONTEND_URL, STRIPE_SECRET_KEY } from '@/utils/constants.js';
import {
    Payment,
    APIKey,
    User,
    Chunk,
    DataProcessor,
    DataSupplier,
    Payload,
    Confirmation,
} from '@/database/models/index.js';
import express from 'express';
import cors from 'cors';
import { Connection, createConnection, getCustomRepository } from 'typeorm';
import { APIKeyRepository } from '@/database/APIKey/APIKeyRepository.js';
import { UserRepository } from '@/database/User/UserRepository.js';
import { DataProcessorRepository } from '@/database/DataProcessor/DataProcessorRepository.js';
import { DataSupplierRepository } from '@/database/DataSupplier/DataSupplierRepository.js';
import { ConfirmationRepository } from '@/database/Confirmation/ConfirmationRepository.js';
import { PayloadRepository } from '@/database/Payload/PayloadRepository.js';
import { ChunkRepository } from '@/database/Chunk/ChunkRepository.js';
import strictTransportSecurity from 'strict-transport-security';
import { sessionMiddleware } from '@/middleware/index.js';
import Stripe from 'stripe';
import { PaymentRepository } from '@/database/Payment/PaymentRepository.js';

class App {
    public static app: App;
    public expressApp: express.Application;
    public db: Connection;
    public apiKeyRepository: APIKeyRepository;
    public userRepository: UserRepository;
    public confirmationRepository: ConfirmationRepository;
    public dataProcessorRepository: DataProcessorRepository;
    public dataSupplierRepository: DataSupplierRepository;
    public payloadRepository: PayloadRepository;
    public chunkRepository: ChunkRepository;
    public paymentRepository: PaymentRepository;
    public stripe: Stripe;

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
                origin: FRONTEND_URL,
                credentials: true,
            })
        );
        const sts = strictTransportSecurity.getSTS({ 'max-age': { days: 30 } });
        this.app.expressApp.use(sts);
    }

    private static async configureDB(): Promise<Connection> {
        const connection = await createConnection({
            type: 'postgres',
            host: 'localhost',
            port: DB_PORT,
            username: 'breadwinnerAdmin',
            password: 'xo9Lw0y50DV06j7QSJ4A',
            database: 'breadwinner',
            entities: [
                Payment,
                APIKey,
                User,
                Chunk,
                DataProcessor,
                DataSupplier,
                Payload,
                Confirmation,
            ],
            dropSchema: process.env.npm_config_SYNC !== undefined,
            synchronize: true,
            logging: false,
        });

        this.app.apiKeyRepository = getCustomRepository(APIKeyRepository);
        this.app.userRepository = getCustomRepository(UserRepository);
        this.app.confirmationRepository = getCustomRepository(ConfirmationRepository);
        this.app.dataProcessorRepository = getCustomRepository(DataProcessorRepository);
        this.app.dataSupplierRepository = getCustomRepository(DataSupplierRepository);
        this.app.payloadRepository = getCustomRepository(PayloadRepository);
        this.app.chunkRepository = getCustomRepository(ChunkRepository);
        this.app.paymentRepository = getCustomRepository(PaymentRepository);
        return connection;
    }

    public static async getAppInstance(): Promise<App> {
        if (!this.app) {
            this.app = new App();
            this.app.expressApp = express();
            this.configureExpressApp();
            this.app.db = await this.configureDB();
            this.app.stripe = new Stripe(STRIPE_SECRET_KEY, {
                apiVersion: '2020-08-27',
            });
        }

        return this.app;
    }
}

export default await App.getAppInstance();
