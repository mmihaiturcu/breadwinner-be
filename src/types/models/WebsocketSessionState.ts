import { DataProcessor } from '@/database/models/index';

export interface WebsocketSessionState {
    dataProcessorId: DataProcessor['id'];
    payloadToken: string;
}
