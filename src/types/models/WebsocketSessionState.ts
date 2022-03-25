import { DataProcessor } from '@/database/models';

export interface WebsocketSessionState {
    apiKey: string;
    dataProcessor: DataProcessor;
    payloadToken: string;
}
