import express from 'express';

export const authRouter = express.Router();
import {body} from 'express-validator';
import {User} from '../models/user.js';
import {getStatus, login, signup, updateUserStatus} from '../controllers/auth.js';
import {isAuth} from '../middleware/is-auth.js';

authRouter.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Email should be correct')
        .custom((value, {req}) => {
            return User.findOne({email: value})
                .then(user => {
                    if (user) return Promise.reject('Such email is already registered');
                });
        })
        .normalizeEmail(),
    body('password').trim().isLength({min: 5}),
    body('name').trim().not().isEmpty(),
    signup,
]);

authRouter.post('/login', login);

authRouter.get('/status', isAuth, getStatus);

authRouter.patch('/status', isAuth, [body('status').not().isEmpty()], updateUserStatus);
