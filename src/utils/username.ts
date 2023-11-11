export function setUsername(req: Express.Request): string | undefined {
    let username : string | undefined;
    if (req.session.user) {
        username = req.session.user.username
    }
    return username
}