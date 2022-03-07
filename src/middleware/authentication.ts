export function authenticationMiddleware(req, res, next) {
    if (!req.session || !req.session.user) {
        const err = new Error('You shall not pass');
        next(err);
    }
    next();
}
