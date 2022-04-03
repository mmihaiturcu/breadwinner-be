import { DataProcessor } from '@/database/models/index';

export interface WebsocketSessionState {
    apiKey: string;
    dataProcessorId: DataProcessor['id'];
    payloadToken: string;
}
