import { csrfMiddleware, loggingMiddleware } from '@/middleware/index.js';
import { CheckConfirmationLinkValidRequest } from '@/types/payloads/requests/CheckConfirmationLinkValidRequest.js';
import { Body, Controller, Post, UseAfter, UseBefore } from 'routing-controllers';
import { verifyConfirmation } from './ConfirmationService.js';

@UseAfter(loggingMiddleware)
@Controller('/confirmation')
export class ConfirmationController {
    @UseBefore(csrfMiddleware)
    @Post('/verify')
    async verify(@Body() payload: CheckConfirmationLinkValidRequest) {
        const isValid = await verifyConfirmation(payload.uuid);
        return isValid;
    }
}
