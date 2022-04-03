import app from '@/config/App';
import {
    CHUNK_INPUT_SAVE_PATH,
    CHUNK_OUTPUT_SAVE_PATH,
    GALOIS_KEYS_SAVE_PATH,
    PUBLIC_KEYS_SAVE_PATH,
    RELIN_KEYS_SAVE_PATH,
    SERVER_PORT,
} from '@/utils/constants';
import https from 'https';
import { readFileSync } from 'fs';
import {
    HttpError,
    InternalServerError,
    NotFoundError,
    useExpressServer,
} from 'routing-controllers';
import { UserController } from '@/database/User/UserController';
import { APIKeyController } from '@/database/APIKey/APIKeyController';
import { WebSocket, WebSocketServer } from 'ws';
import { checkAPIKeyValid } from '@/database/APIKey/APIKeyService';
import { ConfirmationController } from './database/Confirmation/ConfirmationController';
import { PayloadController } from './database/Payload/PayloadController';
import { getProcessingPayload, saveChunkProcessingResult } from './database/Payload/PayloadService';
import { WebsocketEvent } from './types/models/WebsocketEvent';
import { WebsocketEventTypes } from './types/enums/WebsocketEventTypes';
import { ChunkProcessedEventData } from './types/models/ChunkProcessedEventData';
import { ChunkController } from './database/Chunk/ChunkController';
import { ErrorRequestHandler, raw } from 'express';
import { cleanDirectory, getUUIDV4 } from './utils/helper';
import { createDefaultUsers } from './database/User/UserService';
import { WebsocketSessionState } from './types/models/WebsocketSessionState';
import { handleWebhookEvent, PaymentController } from './database/Payment/PaymentController';
import '@/tasks/deletePendingPayloads';
import '@/tasks/payForProcessedChunks';
import 'reflect-metadata';

useExpressServer(app.expressApp, {
    controllers: [
        APIKeyController,
        UserController,
        ConfirmationController,
        PayloadController,
        ChunkController,
        PaymentController,
    ],
    defaultErrorHandler: false,
});

app.expressApp.use(function (error, req, res, next) {
    if (error instanceof HttpError) {
        res.status(error.httpCode).send(error);
    } else {
        console.log(error);
        res.status(500).send(new InternalServerError('Unhandled error'));
    }
} as ErrorRequestHandler);

app.expressApp.post('/payment/webhook', raw({ type: 'application/json' }), handleWebhookEvent);

const httpsServer = https.createServer(
    {
        key: readFileSync('src/config/private.pem', 'utf-8'),
        cert: readFileSync('src/config/certificate.pem', 'utf-8'),
    },
    app.expressApp
);

httpsServer.listen(SERVER_PORT);

console.log(`Server listening on port ${SERVER_PORT}...`);

if (process.env.npm_config_SYNC !== undefined) {
    cleanDirectory(CHUNK_INPUT_SAVE_PATH);
    cleanDirectory(CHUNK_OUTPUT_SAVE_PATH);
    cleanDirectory(PUBLIC_KEYS_SAVE_PATH);
    cleanDirectory(RELIN_KEYS_SAVE_PATH);
    cleanDirectory(GALOIS_KEYS_SAVE_PATH);
    await createDefaultUsers();
}

const wss = new WebSocketServer({ noServer: true });

/**
 * Map which stores randomly generated payload submission tokens for WebSocket instances.
 * A WebSocket instance is given the token when REQUEST_CHUNK is called, and must provide it in order to properly submit it when sending a SEND_CHUNK_PROCESSING_RESULT type message.
 */
const socketMap = new Map<WebSocket, WebsocketSessionState>();

// #DISSERTATION https://www.freecodecamp.org/news/best-practices-for-building-api-keys-97c26eabfea9/
// req.headers.origin - get the hostname of the user signing up for an API key.
// Needs to be unique, random and non-guessable. API keys that are generated must also use Alphanumeric and special characters.
// Store it HASHED! Treat it like a password for all purposes.
// Store a PREFIX for each api key, to make identification easier for users (when managing API key).
// #STRETCHGOAL Make API keys based on different clearance regions (maybe different tiers of data, AS IN PREMIUM -> receives important payloads, after having shown loyalty / seriousness)

wss.on('connection', function connection(ws) {
    ws.on('message', async function message(payload) {
        const message = JSON.parse(payload.toString()) as WebsocketEvent;
        switch (message.type) {
            case WebsocketEventTypes.REQUEST_CHUNK: {
                const processingPayload = await getProcessingPayload();

                if (processingPayload) {
                    const payloadToken = getUUIDV4();
                    const socketState = socketMap.get(ws);
                    if (socketState) {
                        socketState.payloadToken = payloadToken;
                        ws.send(
                            JSON.stringify({ payload: processingPayload, token: payloadToken })
                        );
                    }
                } else {
                    ws.send('');
                }
                break;
            }
            case WebsocketEventTypes.SEND_CHUNK_PROCESSING_RESULT: {
                const data = message.data as ChunkProcessedEventData;
                const socketState = socketMap.get(ws);
                if (socketState) {
                    if (data.token === socketState.payloadToken) {
                        await saveChunkProcessingResult(socketState.dataProcessorId, data);
                    }
                }
                break;
            }
        }
    });
});

httpsServer.on('upgrade', async function upgrade(request, socket, head) {
    try {
        const apiKey = request.headers['sec-websocket-protocol'];

        if (!apiKey || Array.isArray(apiKey)) {
            throw new NotFoundError('Received invalid API key');
        }

        if (request.headers.host) {
            const dataProcessorId = await checkAPIKeyValid(
                apiKey as string,
                request.headers.host.substring(0, request.headers.host.indexOf(':'))
            );

            wss.handleUpgrade(request, socket, head, function done(ws) {
                socketMap.set(ws, {
                    apiKey,
                    dataProcessorId,
                    payloadToken: '',
                });
                wss.emit('connection', ws, request);
            });
        } else {
            throw new NotFoundError('Host header not present.');
        }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            socket.write(error.message);
        }
        socket.destroy();
        return;
    }
});
