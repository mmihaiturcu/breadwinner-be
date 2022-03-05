import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { PayloadDTO } from '@/types/models/index.js';
import { Body, Controller, Get, Param, Post, UseAfter } from 'routing-controllers';
import { Payload } from './Payload.js';
import { createPayload, getDecryptInfoForPayload } from './PayloadService.js';

@Controller('/payload')
export class PayloadController {
    @Post('/createPayload')
    @UseAfter(loggingMiddleware)
    async createPayload(@Body() payload: PayloadDTO) {
        await createPayload(payload);
        return null;
    }

    @Get('/:id/decryptInfo')
    @UseAfter(loggingMiddleware)
    async getDecryptInfoForPayload(@Param('id') id: Payload['id']) {
        return await getDecryptInfoForPayload(id);
    }
}
