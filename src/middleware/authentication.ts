export function authenticationMiddleware(req, res, next) {
    if (!req.session || !req.session.user.id) {
        res.status(401).send('Session not found');
    } else {
        next();
    }
}
