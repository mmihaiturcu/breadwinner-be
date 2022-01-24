import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import {
    UserCreateRequest,
    UserFinishRequest,
    UserLoginRequest,
} from '@/types/payloads/requests/index.js';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { createUser, finishUserAccount, loginUser } from './UserService.js';

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
        console.log('login');
        const userDetails = await loginUser(payload);
        return userDetails;
    }
}
