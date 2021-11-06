import { loggingMiddleware } from '@config/loggingMiddleware.js';
import { Controller, Get, UseAfter } from 'routing-controllers';

@Controller('/users')
export class ApplicationUserController {
    @Get('/test')
    @UseAfter(loggingMiddleware)
    testController() {
        console.log('da');
        return 'Thank you';
    }
}
