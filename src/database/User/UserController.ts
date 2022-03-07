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
import { authenticationMiddleware, loggingMiddleware } from '@/middleware/index.js';

@UseAfter(loggingMiddleware)
@Controller('/user')
export class UserController {
    @Post('/create')
    async createAccount(@Body() payload: UserCreateRequest) {
        await createUser(payload);
        return null;
    }

    @Post('/finish')
    async finishAccount(@Body() payload: UserFinishRequest) {
        await finishUserAccount(payload);
        return null;
    }

    @Post('/login')
    async login(@Req() req, @Body() payload: UserLoginRequest) {
        const userDetails = await loginUser(payload);
        req.session.user = userDetails;
        return userDetails;
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
