import mongoose, {Schema} from 'mongoose';

const schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {timestamps: true});

export const Post = mongoose.model('Post', postSchema);
