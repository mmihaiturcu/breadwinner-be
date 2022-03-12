import { authenticationMiddleware, csrfMiddleware, loggingMiddleware } from '@/middleware/index.js';
import { PayloadDTO } from '@/types/models/index.js';
import { Body, Controller, Get, Param, Post, Req, UseAfter, UseBefore } from 'routing-controllers';
import { User } from '../User/User.js';
import { validateResourceBelongsToSessionUser } from '../User/UserService.js';
import { Payload } from './Payload.js';
import { createPayload, getDecryptInfoForPayload } from './PayloadService.js';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/payload')
export class PayloadController {
    @UseBefore(csrfMiddleware)
    @Post('/createPayload')
    async createPayload(@Req() req, @Body() payload: PayloadDTO) {
        validateResourceBelongsToSessionUser(req.session.user.id, payload.userId);
        await createPayload(payload);
        return null;
    }

    @Get('/:userId/:id/decryptInfo')
    async getDecryptInfoForPayload(
        @Req() req,
        @Param('userId') userId: User['id'],
        @Param('id') id: Payload['id']
    ) {
        validateResourceBelongsToSessionUser(req.session.user.id, userId);
        return await getDecryptInfoForPayload(id);
    }
}
