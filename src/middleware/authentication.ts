export function authenticationMiddleware(req, res, next) {
    if (!req.session || !req.session.user.id || !req.session.user.validated2FA) {
        res.status(401).send(
            'Session not found or the user has not validated 2FA and must have done so.'
        );
    } else {
        next();
    }
}
