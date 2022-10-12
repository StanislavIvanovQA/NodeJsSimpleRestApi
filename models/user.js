import mongoose, {Schema} from 'mongoose';

const schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'New user',
    },
    posts: [
        {type: Schema.Types.ObjectId, ref: 'Post'},
    ],
});

export const User = mongoose.model('User', userSchema);
