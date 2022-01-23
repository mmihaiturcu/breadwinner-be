import { HttpError } from 'routing-controllers';

export default class HTTPGoneError extends HttpError {
    public message: string;

    constructor(message: string) {
        super(500);
        Object.setPrototypeOf(this, HTTPGoneError.prototype);
        this.message = message;
    }

    toJSON() {
        return {
            failedOperation: this.message,
        };
    }
}
