import { Role } from '@/types/enums/index.js';
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

export const INPUT_SAVE_PATH = resolve(process.cwd(), 'chunks', 'input');
export const OUTPUT_SAVE_PATH = resolve(process.cwd(), 'chunks', 'output');

export const USER_ROLE_TO_STRING = {
    [Role.DATA_SUPPLIER]: 'Data supplier',
    [Role.DATA_PROCESSOR]: 'Data processor',
};
