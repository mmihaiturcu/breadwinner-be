import {
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
    Enable2FARequest,
} from '@/types/payloads/requests/index.js';
import { Body, Controller, Get, Post, UseAfter, Req, UseBefore, Delete } from 'routing-controllers';
import {
    createUser,
    disable2FA,
    enable2FA,
    finishUserAccount,
    getTrialQRCode,
    loginUser,
    sendAccountConfirmationEmail,
    validate2FAToken,
} from './UserService.js';
import { getApiKeysForUser } from '../APIKey/APIKeyService.js';
import { getPayloadsForUser } from '../Payload/PayloadService.js';
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
        const { userDetails, secretFor2FA } = await loginUser(payload);
        await regenerateSession(req.session);
        const enabled2FA = secretFor2FA !== null;
        req.session.user = { ...userDetails, enabled2FA, validated2FA: !enabled2FA, secretFor2FA };
        return {
            ...userDetails,
            csrfToken: req.csrfToken(),
            shouldValidate2FA: enabled2FA,
        };
    }

    @UseBefore(authenticationMiddleware)
    @Get('/apiKeys')
    async getApiKeysForUser(@Req() req) {
        const apiKeys = await getApiKeysForUser(req.session.user.id);
        return apiKeys;
    }

    @UseBefore(authenticationMiddleware)
    @Get('/payloads')
    async getPayloadsForUser(@Req() req) {
        const payloads = await getPayloadsForUser(req.session.user.id);
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

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/getTrialQRCodeSecret')
    async getTrialQRCodeSecret(@Req() req) {
        console.log('before service');
        const response = await getTrialQRCode(req.session.user.email);
        return response;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/enable2FA')
    async enable2FA(@Req() req, @Body() payload: Enable2FARequest) {
        await enable2FA(req.session.user.id, payload);
        return null;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Delete('/disable2FA')
    async disable2FA(@Req() req) {
        await disable2FA(req.session.user.id);
        return null;
    }

    @UseBefore(csrfMiddleware)
    @Post('/validate2FAToken')
    async validate2FAToken(@Req() req, @Body() payload: { token: string }) {
        console.log(req.session.user.secretFor2FA);
        validate2FAToken(req.session.user.secretFor2FA, payload.token);
        req.session.user.validated2FA = true;
        return null;
    }
}
