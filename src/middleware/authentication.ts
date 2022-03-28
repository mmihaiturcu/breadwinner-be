import { UnauthorizedError } from 'routing-controllers';

export function authenticationMiddleware(req, res, next) {
    if (!req.session || !req.session.user?.id || !req.session.user.validated2FA) {
        throw new UnauthorizedError(
            'Session not found / is expired or the user has not validated 2FA and must have done so.'
        );
    } else {
        next();
    }
}
