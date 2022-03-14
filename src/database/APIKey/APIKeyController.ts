import { authenticationMiddleware, loggingMiddleware, csrfMiddleware } from '@/middleware/index.js';
import { CreateApiKeyRequest } from '@/types/payloads/requests/index.js';
import {
    Body,
    Controller,
    Post,
    UseAfter,
    Delete,
    Param,
    UseBefore,
    Req,
} from 'routing-controllers';
import { APIKey } from './APIKey.js';
import { createAPIKey, deleteAPIKey } from './APIKeyService.js';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/apiKey')
export class APIKeyController {
    @UseBefore(csrfMiddleware)
    @Post('/create')
    async create(@Req() req, @Body() payload: CreateApiKeyRequest) {
        const { apiKeyString } = await createAPIKey(req.session.user.id, payload);
        return apiKeyString;
    }

    @UseBefore(csrfMiddleware)
    @Delete('/:id')
    async deleteAPIKeyById(@Param('id') id: APIKey['id']) {
        await deleteAPIKey(id);
        return null;
    }
}
