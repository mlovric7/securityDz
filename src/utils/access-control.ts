import {NextFunction, Request, Response} from "express";
import createError from "http-errors";

export function isAuthenticated(req: Request, res: Response, next: NextFunction){
    if (req.session && req.session.user) {
        return next();
    }
    next(createError(401, 'Prvo se prijavite kako bi mogli pristupiti.'))
}

export function isAuthorized(req: Request, res: Response, next: NextFunction){
    // If the access control is turned off we just skip authorization check and everyone can access everything they found link for
    if(req.session.accessControl) {
        const requestedUserId = req.params.uid;

        if (!requestedUserId || isNaN(Number(requestedUserId))) {
            return res.status(400).send('Invalid user ID');
        }

        if (req.session.user && req.session.user.id === parseInt(requestedUserId, 10)) {
            return next();
        }
        next(createError(403, 'Zabranjen pristup, niste vlasnik ovog racuna!'))
    }
    return next();
}