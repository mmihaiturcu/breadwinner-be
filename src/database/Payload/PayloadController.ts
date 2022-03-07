import { authenticationMiddleware, loggingMiddleware } from '@/middleware/index.js';
import { PayloadDTO } from '@/types/models/index.js';
import { Body, Controller, Get, Param, Post, UseAfter, UseBefore } from 'routing-controllers';
import { Payload } from './Payload.js';
import { createPayload, getDecryptInfoForPayload } from './PayloadService.js';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/payload')
export class PayloadController {
    @Post('/createPayload')
    async createPayload(@Body() payload: PayloadDTO) {
        await createPayload(payload);
        return null;
    }

    @Get('/:id/decryptInfo')
    async getDecryptInfoForPayload(@Param('id') id: Payload['id']) {
        return await getDecryptInfoForPayload(id);
    }
}
