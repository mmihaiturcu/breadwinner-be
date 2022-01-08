import { HttpStatusCode } from '@/types';

export default class BaseError extends Error {
    statusCode: HttpStatusCode;

    constructor(statusCode: HttpStatusCode, message: string) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        this.name = Error.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
    }
}
