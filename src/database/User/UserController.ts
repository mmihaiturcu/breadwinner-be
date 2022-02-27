import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import {
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
} from '@/types/payloads/requests/index.js';
import { Body, Controller, Get, Param, Post, UseAfter } from 'routing-controllers';
import { createUser, finishUserAccount, loginUser } from './UserService.js';
import { getApiKeysForUser } from '../APIKey/APIKeyService.js';
import { getPayloadsForUser } from '../Payload/PayloadService.js';
import { User } from './User.js';
@Controller('/user')
export class UserController {
    @Post('/create')
    @UseAfter(loggingMiddleware)
    async createAccount(@Body() payload: UserCreateRequest) {
        await createUser(payload);
        return null;
    }

    @Post('/finish')
    @UseAfter(loggingMiddleware)
    async finishAccount(@Body() payload: UserFinishRequest) {
        await finishUserAccount(payload);
        return null;
    }

    @Post('/login')
    @UseAfter(loggingMiddleware)
    async login(@Body() payload: UserLoginRequest) {
        const userDetails = await loginUser(payload);
        return userDetails;
    }

    @Get('/:id/apiKeys')
    async getApiKeysForUser(@Param('id') id: User['id']) {
        const apiKeys = await getApiKeysForUser(id);
        return apiKeys;
    }

    @Get('/:id/payloads')
    async getPayloadsForUser(@Param('id') id: User['id']) {
        const payloads = await getPayloadsForUser(id);
        return payloads;
    }
}
