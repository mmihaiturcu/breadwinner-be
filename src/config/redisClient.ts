import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PORT } from '@/utils/constants.js';

const client = createClient({
    legacyMode: true,
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});
await client.connect();

console.log('Redis client connected');
export default client;
