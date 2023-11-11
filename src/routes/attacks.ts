import express, {NextFunction, Request, Response} from 'express';

const router = express.Router();

// view the tournament
router.get('/xss', async (req: Request, res: Response) => {
    // change the xssProtection
    req.session.xssProtection = !req.session.xssProtection
    if(req.session.xssProtection){
        res.clearCookie('sessionId')
        console.log(req.cookies)
    }
    else{
        console.log('Xss protection off')
        res.cookie('sessionId', req.cookies['connect.sid'])
    }
    res.redirect('back')
});

router.get('/access-control', async (req: Request, res: Response) => {
    // change the access control protection
    req.session.accessControl = !req.session.accessControl
    res.redirect('back')
});

export default router;
