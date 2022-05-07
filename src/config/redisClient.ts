import dotenv from 'dotenv';
import { resolve } from 'path';
const parse = dotenv.config({ path: resolve(process.cwd(), '.env') });
import { createClient } from 'redis';

const client = createClient({
    legacyMode: true,
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASS,
});

try {
    await client.connect();
} catch (err) {
    console.log('REDIS IS NOT RUNNING, use: sudo service redis-server start');
    process.exit(1);
}

console.log('Redis client connected');
export default client;
