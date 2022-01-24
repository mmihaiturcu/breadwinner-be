import { HttpError } from 'routing-controllers';

export class HTTPConflictError extends HttpError {
    public message: string;

    constructor(message: string) {
        super(409);
        Object.setPrototypeOf(this, HTTPConflictError.prototype);
        this.message = message;
    }

    toJSON() {
        return {
            message: this.message,
        };
    }
}
