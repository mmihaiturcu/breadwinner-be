import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { CheckConfirmationLinkValidRequest } from '@/types/payloads/requests/CheckConfirmationLinkValidRequest.js';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { verifyConfirmation } from './ConfirmationService.js';

@Controller('/confirmation')
export class ConfirmationController {
    @Post('/verify')
    @UseAfter(loggingMiddleware)
    async verify(@Body() payload: CheckConfirmationLinkValidRequest) {
        const isValid = await verifyConfirmation(payload.uuid);
        return isValid;
    }
}
