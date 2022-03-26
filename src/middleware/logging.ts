export function loggingMiddleware(
    request: Express.Request,
    response: Express.Response,
    next?: (err?: any) => any
): any {
    // console.log(response);
    next();
}
