import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { UserCreateRequest, UserFinishRequest } from '@/types/payloads/requests';
import { UserLoginRequest } from '@/types/payloads/requests/UserLoginRequest';
import { Body, Controller, Post, UseAfter } from 'routing-controllers';
import { createUser, finishUserAccount, loginUser } from './UserService';

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
}
