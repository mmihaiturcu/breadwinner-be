import BaseError from './BaseError';

class NotFoundError extends BaseError {
    message: string;

    constructor(message: string) {
        super(404, message);

        this.message = message;
    }
}
