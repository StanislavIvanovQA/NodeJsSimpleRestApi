import * as dotenv from 'dotenv';

dotenv.config();
import * as path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import {router as feedRouter} from './routes/feed.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import {authRouter} from './routes/auth.js';

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png'
        || file.mimetype === 'image/jpg'
        || file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json());
app.use('/images/', express.static(path.join(__dirname, 'images')));
app.use(multer({storage, fileFilter}).single('image'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/feed', feedRouter);
app.use('/auth', authRouter);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    res.status(status).json(error);
});

const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t1icl.mongodb.net/messages?retryWrites=true&w=majority`;
mongoose.connect(mongoUri)
    .then(res => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err);
    });

