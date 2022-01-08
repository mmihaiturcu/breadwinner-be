import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { Request } from 'express';
import { Controller, Post, Req, UseAfter } from 'routing-controllers';
import { createAPIKey } from './APIKeyService.js';

@Controller('/apiKey')
export class APIKeyController {
    @Post('/create')
    @UseAfter(loggingMiddleware)
    async create(@Req() req: Request) {
        const { apiKeyString } = await createAPIKey(req.headers.origin);
        return apiKeyString;
    }
}
