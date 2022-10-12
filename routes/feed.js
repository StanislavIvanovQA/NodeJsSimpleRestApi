import express from 'express';
import {deletePost, getPost, getPosts, postPost, updatePost} from '../controllers/feed.js';
import {body} from 'express-validator';
import {isAuth} from '../middleware/is-auth.js';

export const router = express.Router();
router.get('/posts', isAuth, getPosts);

router.post('/post', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5}),
], postPost);

router.get('/post/:postId', getPost);

router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5}),
], updatePost);

router.delete('/post/:postId', isAuth, deletePost);
