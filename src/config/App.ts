import { DB_PORT, FRONTEND_URL } from '@/utils/constants.js';
import {
    APIKey,
    User,
    Chunk,
    DataProcessor,
    DataSupplier,
    FileResource,
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
import { FileResourceRepository } from '@/database/FileResource/FileResourceRepository.js';
import strictTransportSecurity from 'strict-transport-security';

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
    public fileResourceRepository: FileResourceRepository;

    private constructor() {
        //
    }

    private static configureExpressApp(): void {
        this.app.expressApp.use(express.urlencoded({ extended: true }));
        this.app.expressApp.use(express.json({ limit: '50mb' })); // To parse the incoming requests with JSON payloads
        this.app.expressApp.use(
            cors({
                origin: FRONTEND_URL,
            })
        );
        const sts = strictTransportSecurity.getSTS({ 'max-age': { days: 30 } });
        this.app.expressApp.use(sts);
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
                Payload,
                Confirmation,
            ],
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
        this.app.fileResourceRepository = getCustomRepository(FileResourceRepository);
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
