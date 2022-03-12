import {
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
} from '@/types/payloads/requests/index.js';
import { Body, Controller, Get, Param, Post, UseAfter, Req, UseBefore } from 'routing-controllers';
import {
    createUser,
    finishUserAccount,
    loginUser,
    sendAccountConfirmationEmail,
    validateResourceBelongsToSessionUser,
} from './UserService.js';
import { getApiKeysForUser } from '../APIKey/APIKeyService.js';
import { getPayloadsForUser } from '../Payload/PayloadService.js';
import { User } from './User.js';
import { authenticationMiddleware, loggingMiddleware, csrfMiddleware } from '@/middleware/index.js';
import { getUUIDV4, regenerateSession } from '@/utils/helper.js';

@UseAfter(loggingMiddleware)
@Controller('/user')
export class UserController {
    @UseBefore(csrfMiddleware)
    @Get('/csrf')
    async getCSRFToken(@Req() req) {
        return req.csrfToken();
    }

    @UseBefore(csrfMiddleware)
    @Get('/session')
    async getSession(@Req() req) {
        if (req.session && req.session.user && typeof req.session.user === 'object') {
            return {
                ...req.session.user,
                csrfToken: req.csrfToken(),
            };
        } else {
            await regenerateSession(req.session);
            req.session.user = getUUIDV4();
        }
        return null;
    }

    @UseBefore(csrfMiddleware)
    @Post('/create')
    async createAccount(@Body() payload: UserCreateRequest) {
        const { user, confirmation } = await createUser(payload);
        await sendAccountConfirmationEmail(user, confirmation);
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
        const userDetails = await loginUser(payload);
        await regenerateSession(req.session);
        req.session.user = userDetails;
        return { ...userDetails, csrfToken: req.csrfToken() };
    }

    @UseBefore(authenticationMiddleware)
    @Get('/:id/apiKeys')
    async getApiKeysForUser(@Req() req, @Param('id') id: User['id']) {
        validateResourceBelongsToSessionUser(req.session.user.id, id);
        const apiKeys = await getApiKeysForUser(id);
        return apiKeys;
    }

    @UseBefore(authenticationMiddleware)
    @Get('/:id/payloads')
    async getPayloadsForUser(@Req() req, @Param('id') id: User['id']) {
        validateResourceBelongsToSessionUser(req.session.user.id, id);
        const payloads = await getPayloadsForUser(id);
        return payloads;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/logout')
    async logout(@Req() req) {
        await regenerateSession(req.session);
        req.session.user = getUUIDV4();
        return req.csrfToken();
    }
}
