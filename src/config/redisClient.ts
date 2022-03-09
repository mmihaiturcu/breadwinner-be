import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PORT } from '@/utils/constants.js';

const client = createClient({
    legacyMode: true,
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

try {
    await client.connect();
} catch (err) {
    console.log('REDIS IS NOT RUNNING, use: sudo service redis-server start');
    process.exit(1);
}

console.log('Redis client connected');
export default client;
