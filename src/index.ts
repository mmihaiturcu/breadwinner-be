import App from '@config/App.js';
import { SERVER_PORT } from '@utils/constants.js';

const app = await App.getAppInstance();

app.expressApp.listen(SERVER_PORT);
