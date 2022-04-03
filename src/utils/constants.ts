import { Role } from '@/database/models/index';
import { resolve } from 'path';

export const SERVER_PORT = 8420;
export const DB_PORT = 5432;
export const FRONTEND_URL = 'https://localhost:8080';
export const BACKEND_URL = `https://localhost:${SERVER_PORT}`;

export const REDIS_HOST = 'localhost';
export const REDIS_PORT = 6379;

export const EMAIL_HOST = 'smtp.gmail.com';
export const EMAIL_HOST_PORT = 465;
export const EMAIL_USERNAME = 'thalros1760@gmail.com';
export const EMAIL_PASSWORD = 'ywkqkpxzpeweuhiw';

export const STRIPE_SECRET_KEY =
    'sk_test_51KhJTjH5jouyExdJtqfd4OZCTAaQrHzEPErawoCx0OS4AeLMOZF9jNHydV8U9lmfkNhD8OSAT4EFl6I79abEnyzG00o4itSNwS';
export const STRIPE_WEBHOOK_SECRET =
    'whsec_1c3de12b4a486416affa157e7330b4be59a66a8fe682d8487c790727553e208a';

export const CHUNK_INPUT_SAVE_PATH = resolve(process.cwd(), 'files', 'chunks', 'input');
export const CHUNK_OUTPUT_SAVE_PATH = resolve(process.cwd(), 'files', 'chunks', 'output');
export const PUBLIC_KEYS_SAVE_PATH = resolve(process.cwd(), 'files', 'keys', 'public');
export const RELIN_KEYS_SAVE_PATH = resolve(process.cwd(), 'files', 'keys', 'relin');
export const GALOIS_KEYS_SAVE_PATH = resolve(process.cwd(), 'files', 'keys', 'galois');

export const USER_ROLE_TO_STRING = {
    [Role.DATA_SUPPLIER]: 'Data supplier',
    [Role.DATA_PROCESSOR]: 'Data processor',
    [Role.ADMIN]: 'Admin',
};

export const DATA_PROCESSING_PRODUCT_STRIPE_ID = 'prod_LOPQsPEz1lfqCR';

// Prices in $
export const PRICE_PER_CHUNK = 0.01;
export const PRICE_PER_OPERATION = 0.005;
export const MIN_PAYLOAD_PRICE = 0.5;
export const PAYMENT_OFFERED_PER_CHUNK = 0.005;
export const MINIMUM_STRIPE_PAYOUT = 0.25;
export const MINIMUM_CHUNKS_FOR_PAYOUT = MINIMUM_STRIPE_PAYOUT / PAYMENT_OFFERED_PER_CHUNK;
