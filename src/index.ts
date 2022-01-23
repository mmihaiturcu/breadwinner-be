import app from '@/config/App.js';
import { SERVER_PORT } from '@/utils/constants.js';
import https from 'https';
import { readFileSync } from 'fs';
import { NotFoundError, useExpressServer } from 'routing-controllers';
import { UserController } from '@/database/User/UserController.js';
import { APIKeyController } from '@/database/APIKey/APIKeyController.js';
import { WebSocketServer } from 'ws';
import { checkAPIKeyValid } from '@/database/APIKey/APIKeyService.js';

useExpressServer(app.expressApp, {
    controllers: [UserController, APIKeyController],
});

const httpsServer = https.createServer(
    {
        key: readFileSync('src/config/private.pem', 'utf-8'),
        cert: readFileSync('src/config/certificate.pem', 'utf-8'),
    },
    app.expressApp
);

httpsServer.listen(SERVER_PORT);

console.log(`Server listening on port ${SERVER_PORT}...`);

const wss = new WebSocketServer({ noServer: true });

// #DISSERTATION https://www.freecodecamp.org/news/best-practices-for-building-api-keys-97c26eabfea9/
// req.headers.origin - get the hostname of the user signing up for an API key.
// Needs to be unique, random and non-guessable. API keys that are generated must also use Alphanumeric and special characters.
// Store it HASHED! Treat it like a password for all purposes.
// Store a PREFIX for each api key, to make identification easier for users (when managing API key).
// #STRETCHGOAL Make API keys based on different clearance regions (maybe different tiers of data, AS IN PREMIUM -> receives important payloads, after having shown loyalty / seriousness)

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });
});

httpsServer.on('upgrade', async function upgrade(request, socket, head) {
    // This function is not defined on purpose. Implement it with your own logic.
    try {
        const apiKey = request.headers['sec-websocket-protocol'];

        if (!apiKey || Array.isArray(apiKey)) {
            throw new NotFoundError('Received invalid API key');
        }

        await checkAPIKeyValid(apiKey as string, request.headers.origin);

        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            socket.write(error.message);
        }
        socket.destroy();
        return;
    }
});
