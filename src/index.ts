import App from '@config/App.js';
import { SERVER_PORT } from '@utils/constants.js';
import https from 'https';
import { readFileSync } from 'fs';
import { useExpressServer } from 'routing-controllers';
import { ApplicationUserController } from '@database/ApplicationUser/ApplicationUserController.js';

const app = await App.getAppInstance();

useExpressServer(app.expressApp, {
    controllers: [ApplicationUserController],
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
