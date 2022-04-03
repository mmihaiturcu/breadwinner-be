import { authenticationMiddleware, csrfMiddleware, loggingMiddleware } from '@/middleware/index';
import { PayloadDTO } from '@/types/models/index';
import { Request } from 'express';
import { Body, Controller, Get, Param, Post, Req, UseAfter, UseBefore } from 'routing-controllers';
import { validateResourceBelongsToSessionUser } from '../User/UserService';
import { createPayload, getDecryptInfoForPayload } from './PayloadService';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/payload')
export class PayloadController {
    @UseBefore(csrfMiddleware)
    @Post('/createPayload')
    async createPayload(@Req() req: Request, @Body() payload: PayloadDTO) {
        await createPayload(req.session.user!.roleSpecificId, payload);
        return null;
    }

    @Get('/:userId/:id/decryptInfo')
    async getDecryptInfoForPayload(
        @Req() req: Request,
        @Param('userId') userId: string,
        @Param('id') id: string
    ) {
        validateResourceBelongsToSessionUser(req.session.user!.roleSpecificId, userId);
        return await getDecryptInfoForPayload(id);
    }
}
