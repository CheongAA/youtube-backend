import express from 'express';
import { signup, login, me } from '../controllers/auth';
import { protect } from '../middlewares/auth';

export const authRouter = express.Router();

authRouter.route('/signup').post(signup);
authRouter.route('/login').post(login);
authRouter.route('/me').get(protect, me);

