import createError from 'http-errors';
import express, {Express, NextFunction, Request, Response} from 'express';
import path from 'path';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import attacksRouter from './routes/attacks';
import messagesRouter from './routes/messages'
import dotenv from 'dotenv'
import session from 'express-session'
import {setUsername} from "./utils/username";
import pool from "./database/db";

declare module 'express-session' {
    interface SessionData {
        user: { [key: string]: any };
        xssProtection: boolean;
        accessControl: boolean;
    }
}

dotenv.config()

const app: Express = express();

// Zadatak
// TODO 2. Cross-site scripting (XSS) - jedan tip XSS napada po izboru (bilo koji) - stored (2. drugi) refletivni je tesko napravit toggle!
// TODO 2. Loša kontrola pristupa (Broken Access Control)

// view engine setup
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../src/public')));
app.use('/css', express.static(path.join(__dirname, '..//node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, '..//node_modules/bootstrap/dist/js')))

/**
 * Get port from environment and store in Express.
 */
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.set('port', port);

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({
    store: new (require('connect-pg-simple')(session))({
        pool: pool
    }),
    // @ts-ignore
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true }
}))

function addDataToResponse(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.user) {
        res.locals.username = req.session.user.username;
        res.locals.userId = req.session.user.id;
    }
    res.locals.xssProtection = req.session.xssProtection;
    res.locals.accessControl = req.session.accessControl;
    // Continue to the next middleware in the stack
    next();
}

app.use(addDataToResponse);

app.use('/', indexRouter);
app.use('/messages', messagesRouter);
app.use('/attacks', attacksRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {username: setUsername(req)});
});

export default app;
