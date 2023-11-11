import express, {NextFunction, Request, Response} from 'express';
import {setUsername} from "../utils/username";
import createError from "http-errors";
import {
    getUser,
    getMessagesForUser,
    addNewMessage
} from "../service/users-service";
import {isAuthenticated, isAuthorized} from "../utils/access-control";

const router = express.Router();

// get all messages for a user
router.get('/user/:uid', isAuthenticated, isAuthorized, async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uid
    const user = await getUser(userId)

    if (user) {
        const messages = await getMessagesForUser(user.id)
        const username = setUsername(req)
        res.render('messages', { messages: messages });
        return
    }
    // throw error from here
    next(createError(404, 'Ne postoji korisnik s tim id.'));
});

// add a message for a user
router.post('/user/:uid', isAuthenticated, isAuthorized, async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uid
    const user = await getUser(userId)

    if (user) {
        const newMessage = req.body.message
        await addNewMessage(newMessage, userId)

        res.redirect('/');
        return
    }

    next(createError(404, 'Ne postoji korisnik s tim id.'));
});


export default router;
