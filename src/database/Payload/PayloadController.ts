import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { PayloadDTO } from '@/types/models/index.js';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { createPayload } from './PayloadService.js';

@Controller('/payload')
export class PayloadController {
    @Post('/createPayload')
    @UseAfter(loggingMiddleware)
    async createPayload(@Body() payload: PayloadDTO) {
        await createPayload(payload);
        return null;
    }
}
