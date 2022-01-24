import { HttpError } from 'routing-controllers';

export class HTTPGoneError extends HttpError {
    public message: string;

    constructor(message: string) {
        super(410);
        Object.setPrototypeOf(this, HTTPGoneError.prototype);
        this.message = message;
    }

    toJSON() {
        return {
            message: this.message,
        };
    }
}
