import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { CreateApiKeyRequest } from '@/types/payloads/requests/index.js';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { createAPIKey } from './APIKeyService.js';

@Controller('/apiKey')
export class APIKeyController {
    @Post('/create')
    @UseAfter(loggingMiddleware)
    async create(@Body() payload: CreateApiKeyRequest) {
        const { apiKeyString } = await createAPIKey(payload);
        return apiKeyString;
    }
}
