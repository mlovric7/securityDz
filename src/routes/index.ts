import express, {Request, Response} from 'express';
import {setUsername} from "../utils/username";
import bcrypt from "bcrypt";
import pool from "../database/db";
import {getLatestMessages} from "../service/users-service";

const router = express.Router();

/* GET home page. */
router.get('/',async (req: Request, res: Response) => {
  if(req.session && req.session.user){
    res.locals.messages = await getLatestMessages()
  }
  if(!req.session.xssProtection){
    res.cookie('sessionId', req.cookies['connect.sid'])
  }
  res.render('index', { title: 'Express', currentPage: 'home', competitions: [], username: setUsername(req)});
});

//login page
router.get('/login', (req: Request, res: Response) => {
    if (req.session && req.session.user) {
      return res.redirect('/');
    }

    res.render('login', { currentPage: 'sign in' });
})

//login user
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Query the user from the database
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id, username: user.username };
    return res.redirect('/');
  }

  return res.render('login', { error: 'Invalid username or password', currentPage: 'sign in' });
});

//signup page
router.get('/signup', (req: Request, res: Response) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  res.render('signup', { currentPage: 'sign up' });
});

//signup user
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

  if (existingUser.rows.length > 0) {
    return res.render('signup', { error: 'Username already taken', currentPage: 'sign up' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
  const newUser = result.rows[0];

  req.session.user = { id: newUser.id, username: newUser.username };
  res.redirect('/');
});

//logout user
router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('connect.sid')
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error during logout');
    }
    res.redirect('/');
  });
});

export default router;