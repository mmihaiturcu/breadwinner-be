import { loggingMiddleware } from '@/middleware/index.js';
import { CheckConfirmationLinkValidRequest } from '@/types/payloads/requests/CheckConfirmationLinkValidRequest.js';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { verifyConfirmation } from './ConfirmationService.js';

@UseAfter(loggingMiddleware)
@Controller('/confirmation')
export class ConfirmationController {
    @Post('/verify')
    async verify(@Body() payload: CheckConfirmationLinkValidRequest) {
        const isValid = await verifyConfirmation(payload.uuid);
        return isValid;
    }
}
