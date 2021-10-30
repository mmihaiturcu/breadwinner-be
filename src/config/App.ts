import { DB_PORT } from '@utils/constants.js';
import {
    APIKey,
    ApplicationUser,
    Chunk,
    DataProcessor,
    DataSupplier,
    FileResource,
    JSONSchema,
    Payload,
    Role,
} from '@database/models/index.js';
import express from 'express';
import { Connection, createConnection } from 'typeorm';

export default class App {
    public static app: App;
    public expressApp: express.Application;
    public db: Connection;
    private constructor() {}

    private static configureExpressApp(): void {
        this.app.expressApp.use(express.urlencoded({ extended: true }));
        this.app.expressApp.use(express.json()); // To parse the incoming requests with JSON payloads
    }

    private static async configureDB(): Promise<Connection> {
        return await createConnection({
            type: 'postgres',
            host: 'localhost',
            port: DB_PORT,
            username: 'breadwinnerAdmin',
            password: 'xo9Lw0y50DV06j7QSJ4A',
            database: 'breadwinner',
            entities: [
                APIKey,
                ApplicationUser,
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
