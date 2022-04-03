import { csrfMiddleware, loggingMiddleware } from '@/middleware/index';
import { CheckConfirmationLinkValidRequest } from '@/types/payloads/requests/CheckConfirmationLinkValidRequest';
import { Body, Controller, Post, UseAfter, UseBefore } from 'routing-controllers';
import { verifyConfirmation } from './ConfirmationService';

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
