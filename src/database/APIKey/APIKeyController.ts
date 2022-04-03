import { authenticationMiddleware, loggingMiddleware, csrfMiddleware } from '@/middleware/index';
import { CreateApiKeyRequest } from '@/types/payloads/requests/index';
import { Request } from 'express';
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
import { createAPIKey, deleteAPIKey } from './APIKeyService';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/apiKey')
export class APIKeyController {
    @UseBefore(csrfMiddleware)
    @Post('/create')
    async create(@Req() req: Request, @Body() payload: CreateApiKeyRequest) {
        const { apiKeyString } = await createAPIKey(req.session.user!.roleSpecificId, payload);
        return apiKeyString;
    }

    @UseBefore(csrfMiddleware)
    @Delete('/:id')
    async deleteAPIKeyById(@Param('id') id: string) {
        await deleteAPIKey(id);
        return null;
    }
}
