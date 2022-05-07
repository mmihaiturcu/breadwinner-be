import { Role } from '@/database/models/index';
import argon2 from 'argon2';
const { argon2id } = argon2;
import { resolve } from 'path';

export const SERVER_PORT = process.argv[2];
export const BACKEND_URL = `https://localhost:${SERVER_PORT}`;
export const CHUNK_INPUT_SAVE_PATH = resolve(process.cwd(), 'files', 'chunks', 'input');
export const CHUNK_OUTPUT_SAVE_PATH = resolve(process.cwd(), 'files', 'chunks', 'output');
export const PUBLIC_KEYS_SAVE_PATH = resolve(process.cwd(), 'files', 'keys', 'public');
export const RELIN_KEYS_SAVE_PATH = resolve(process.cwd(), 'files', 'keys', 'relin');
export const GALOIS_KEYS_SAVE_PATH = resolve(process.cwd(), 'files', 'keys', 'galois');

export const USER_ROLE_TO_STRING = {
    [Role.DATA_SUPPLIER]: 'Data supplier',
    [Role.DATA_PROCESSOR]: 'Data processor',
};

// Prices in $
export const PRICE_PER_CHUNK = 0.01;
export const PRICE_PER_OPERATION = 0.005;
export const MIN_PAYLOAD_PRICE = 0.5;
export const PAYMENT_OFFERED_PER_CHUNK = 0.005;
export const MINIMUM_STRIPE_PAYOUT = 0.25;
export const MINIMUM_CHUNKS_FOR_PAYOUT = MINIMUM_STRIPE_PAYOUT / PAYMENT_OFFERED_PER_CHUNK;

export const ARGON_OPTIONS = {
    type: argon2id,
    memoryCost: 15360,
    timeCost: 2,
};
