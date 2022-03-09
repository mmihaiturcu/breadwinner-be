import session from 'express-session';
import connectRedis from 'connect-redis';
import redisClient from '@/config/redisClient.js';

const RedisStore = connectRedis(session);
const store = new RedisStore({ client: redisClient });
store.clear();

export const sessionMiddleware = session({
    store: store,
    secret: 'oZQrLuKL1UlldsU9e24W',
    saveUninitialized: false,
    resave: false,
    name: 'SESSION_ID',
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
        sameSite: 'lax',
    },
});
