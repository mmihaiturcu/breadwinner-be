import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { verifyConfirmation } from './ConfirmationService';

@Controller('/confirmation')
export class ConfirmationController {
    @Post('/verify')
    @UseAfter(loggingMiddleware)
    async verify(@Body() uuid: string) {
        const isValid = await verifyConfirmation(uuid);
        return isValid;
    }
}
