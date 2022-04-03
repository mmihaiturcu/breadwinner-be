import {
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
    Enable2FARequest,
} from '@/types/payloads/requests/index';
import { Body, Controller, Get, Post, UseAfter, Req, UseBefore, Delete } from 'routing-controllers';
import {
    createUser,
    disable2FA,
    enable2FA,
    finishUserAccount,
    getConnectedStripeAccountLink,
    getTrialQRCode,
    loginUser,
    sendAccountConfirmationEmail,
    validate2FAToken,
} from './UserService';
import { getApiKeysForUser } from '../APIKey/APIKeyService';
import { getPayloadsForUser } from '../Payload/PayloadService';
import { authenticationMiddleware, loggingMiddleware, csrfMiddleware } from '@/middleware/index';
import { getUUIDV4, regenerateSession } from '@/utils/helper';
import { Request } from 'express';
import { Role } from '../models';

@UseAfter(loggingMiddleware)
@Controller('/user')
export class UserController {
    @UseBefore(csrfMiddleware)
    @Get('/csrf')
    async getCSRFToken(@Req() req: Request) {
        return req.csrfToken();
    }

    @UseBefore(csrfMiddleware)
    @Get('/session')
    async getSession(@Req() req: Request) {
        if (req.session && req.session.user && typeof req.session.user === 'object') {
            return {
                ...req.session.user,
                csrfToken: req.csrfToken(),
            };
        } else {
            await regenerateSession(req.session);
            req.session.user = {
                id: getUUIDV4(),
                email: '',
                enabled2FA: false,
                role: Role.DATA_SUPPLIER,
                roleSpecificId: '',
                validated2FA: false,
                secretFor2FA: '',
            };
        }
        return null;
    }

    @UseBefore(csrfMiddleware)
    @Post('/create')
    async createAccount(@Body() payload: UserCreateRequest) {
        const { email, role, uuid } = await createUser(payload);
        await sendAccountConfirmationEmail(email, role, uuid);
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
    async login(@Req() req: Request, @Body() payload: UserLoginRequest) {
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
    async getApiKeysForUser(@Req() req: Request) {
        const apiKeys = await getApiKeysForUser(req.session.user!.roleSpecificId);
        return apiKeys;
    }

    @UseBefore(authenticationMiddleware)
    @Get('/payloads')
    async getPayloadsForUser(@Req() req: Request) {
        const payloads = await getPayloadsForUser(req.session.user!.roleSpecificId);
        return payloads;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/logout')
    async logout(@Req() req: Request) {
        await regenerateSession(req.session);
        req.session.user = {
            id: getUUIDV4(),
            email: '',
            enabled2FA: false,
            role: Role.DATA_SUPPLIER,
            roleSpecificId: '',
            validated2FA: false,
            secretFor2FA: '',
        };
        return req.csrfToken();
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/getTrialQRCodeSecret')
    async getTrialQRCodeSecret(@Req() req: Request) {
        const response = await getTrialQRCode(req.session.user!.email);
        return response;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/enable2FA')
    async enable2FA(@Req() req: Request, @Body() payload: Enable2FARequest) {
        await enable2FA(req.session.user!.id, payload);
        return null;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Delete('/disable2FA')
    async disable2FA(@Req() req: Request) {
        await disable2FA(req.session.user!.id);
        return null;
    }

    @UseBefore(csrfMiddleware)
    @Post('/validate2FAToken')
    async validate2FAToken(@Req() req: Request, @Body() payload: { token: string }) {
        validate2FAToken(req.session.user!.secretFor2FA, payload.token);
        req.session.user!.validated2FA = true;
        return null;
    }

    @UseBefore(authenticationMiddleware)
    @UseBefore(csrfMiddleware)
    @Post('/getConnectedStripeAccountLink')
    async getConnectedStripeAccountLink(@Req() req: Request) {
        return await getConnectedStripeAccountLink(req.session.user!.roleSpecificId);
    }
}
