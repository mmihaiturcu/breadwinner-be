import session from 'express-session';
import connectRedis from 'connect-redis';
import redisClient from '@/config/redisClient';

const RedisStore = connectRedis(session);
const store = new RedisStore({ client: redisClient });

if (process.env.npm_config_SYNC !== undefined && process.argv[3] === 'MAIN_SERVER') {
    if (store.clear) {
        store.clear();
    }
}

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
