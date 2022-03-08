import {
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
} from '@/types/payloads/requests/index.js';
import { Body, Controller, Get, Param, Post, UseAfter, Req, UseBefore } from 'routing-controllers';
import { createUser, finishUserAccount, loginUser } from './UserService.js';
import { getApiKeysForUser } from '../APIKey/APIKeyService.js';
import { getPayloadsForUser } from '../Payload/PayloadService.js';
import { User } from './User.js';
import { authenticationMiddleware, loggingMiddleware, csrfMiddleware } from '@/middleware/index.js';
import { getUUIDV4 } from '@/utils/helper.js';

@UseAfter(loggingMiddleware)
@Controller('/user')
export class UserController {
    @UseBefore(csrfMiddleware)
    @Get('/csrf')
    async getCSRFToken(@Req() req) {
        req.session.user = getUUIDV4();
        return req.csrfToken();
    }

    @UseBefore(csrfMiddleware)
    @Post('/create')
    async createAccount(@Body() payload: UserCreateRequest) {
        await createUser(payload);
        return null;
    }

    @UseBefore(csrfMiddleware)
    @Post('/finish')
    async finishAccount(@Body() payload: UserFinishRequest) {
        await finishUserAccount(payload);
        return null;
    }

    @UseBefore(csrfMiddleware)
    @Post('/login')
    async login(@Req() req, @Body() payload: UserLoginRequest) {
        return new Promise((resolve) => {
            req.session.regenerate(async () => {
                const userDetails = await loginUser(payload);
                req.session.user = userDetails;
                resolve({ ...userDetails, csrfToken: req.csrfToken() });
            });
        });
    }

    @UseBefore(authenticationMiddleware)
    @Get('/:id/apiKeys')
    async getApiKeysForUser(@Param('id') id: User['id']) {
        const apiKeys = await getApiKeysForUser(id);
        return apiKeys;
    }

    @UseBefore(authenticationMiddleware)
    @Get('/:id/payloads')
    async getPayloadsForUser(@Param('id') id: User['id']) {
        const payloads = await getPayloadsForUser(id);
        return payloads;
    }
}
