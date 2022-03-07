import { authenticationMiddleware, loggingMiddleware } from '@/middleware/index.js';
import { CreateApiKeyRequest } from '@/types/payloads/requests/index.js';
import { Body, Controller, Post, UseAfter, Delete, Param, UseBefore } from 'routing-controllers';
import { APIKey } from './APIKey.js';
import { createAPIKey, deleteAPIKey } from './APIKeyService.js';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/apiKey')
export class APIKeyController {
    @Post('/create')
    async create(@Body() payload: CreateApiKeyRequest) {
        const { apiKeyString } = await createAPIKey(payload);
        return apiKeyString;
    }

    @Delete('/:id')
    async deleteAPIKeyById(@Param('id') id: APIKey['id']) {
        await deleteAPIKey(id);
        return null;
    }
}
