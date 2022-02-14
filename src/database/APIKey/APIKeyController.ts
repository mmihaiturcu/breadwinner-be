import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { CreateApiKeyRequest } from '@/types/payloads/requests/index.js';
import { Body, Controller, Post, UseAfter, Delete, Param } from 'routing-controllers';
import { APIKey } from './APIKey.js';
import { createAPIKey, deleteAPIKey } from './APIKeyService.js';

@Controller('/apiKey')
export class APIKeyController {
    @Post('/create')
    @UseAfter(loggingMiddleware)
    async create(@Body() payload: CreateApiKeyRequest) {
        const { apiKeyString } = await createAPIKey(payload);
        return apiKeyString;
    }

    @Delete('/:id')
    @UseAfter(loggingMiddleware)
    async deleteAPIKeyById(@Param('id') id: APIKey['id']) {
        await deleteAPIKey(id);
        return null;
    }
}
