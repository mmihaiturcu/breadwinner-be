import { DB_PORT, FRONTEND_URL } from '@/utils/constants.js';
import {
    APIKey,
    User,
    Chunk,
    DataProcessor,
    DataSupplier,
    FileResource,
    JSONSchema,
    Payload,
    Role,
} from '@/database/models/index.js';
import express from 'express';
import cors from 'cors';
import { Connection, createConnection, getCustomRepository } from 'typeorm';
import { APIKeyRepository } from '@/database/APIKey/APIKeyRepository.js';
import { UserRepository } from '@/database/User/UserRepository';
import { DataProcessorRepository } from '@/database/DataProcessor/DataProcessorRepository';
import { DataSupplierRepository } from '@/database/DataSupplier/DataSupplierRepository';
import { ConfirmationRepository } from '@/database/Confirmation/ConfirmationRepository';

class App {
    public static app: App;
    public expressApp: express.Application;
    public db: Connection;
    public apiKeyRepository: APIKeyRepository;
    public userRepository: UserRepository;
    public confirmationRepository: ConfirmationRepository;
    public dataProcessorRepository: DataProcessorRepository;
    public dataSupplierRepository: DataSupplierRepository;

    private constructor() {
        //
    }

    private static configureExpressApp(): void {
        this.app.expressApp.use(express.urlencoded({ extended: true }));
        this.app.expressApp.use(express.json()); // To parse the incoming requests with JSON payloads
        this.app.expressApp.use(
            cors({
                origin: FRONTEND_URL,
            })
        );
    }

    private static async configureDB(): Promise<Connection> {
        await createConnection({
            type: 'postgres',
            host: 'localhost',
            port: DB_PORT,
            username: 'breadwinnerAdmin',
            password: 'xo9Lw0y50DV06j7QSJ4A',
            database: 'breadwinner',
            entities: [
                APIKey,
                User,
                Chunk,
                DataProcessor,
                DataSupplier,
                FileResource,
                JSONSchema,
                Payload,
                Role,
            ],
            synchronize: true,
            logging: false,
        });

        this.app.apiKeyRepository = getCustomRepository(APIKeyRepository);
        this.app.userRepository = getCustomRepository(UserRepository);
        this.app.confirmationRepository = getCustomRepository(ConfirmationRepository);
        this.app.dataProcessorRepository = getCustomRepository(DataProcessorRepository);
        this.app.dataSupplierRepository = getCustomRepository(DataSupplierRepository);
        return;
    }

    public static async getAppInstance(): Promise<App> {
        if (!this.app) {
            this.app = new App();
            this.app.expressApp = express();
            this.configureExpressApp();
            this.app.db = await this.configureDB();
        }

        return this.app;
    }
}

export default await App.getAppInstance();
