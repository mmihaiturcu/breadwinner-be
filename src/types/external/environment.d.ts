declare namespace NodeJS {
    interface ProcessEnv {
        REDIS_HOST: string;
        REDIS_PORT: string;
        REDIS_PASS: string;

        EMAIL_HOST: string;
        EMAIL_HOST_PORT: string;
        EMAIL_USERNAME: string;
        EMAIL_PASSWORD: string;

        STRIPE_SECRET_KEY: string;
        STRIPE_WEBHOOK_SECRET: string;
        DATA_PROCESSING_PRODUCT_STRIPE_ID: string;

        FRONTEND_URL: string;

        DATABASE_DSN: string;
    }
}
