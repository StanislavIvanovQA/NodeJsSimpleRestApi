import {validationResult} from 'express-validator'
import {Post} from '../models/post.js'
import {clearImage} from '../utils/file-utils.js'
import {User} from '../models/user.js'
import {socketIo} from '../socket.js'

export const getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = 2
    let totalItems
    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count
            return Post.find()
                .populate('creator')
                .sort({createdAt: -1})
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
        })
        .then(posts => {
            res.status(200).json({
                message: 'posts fetched',
                posts,
                totalItems,
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

export const postPost = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed')
        error.statusCode = 422
        throw error
    }

    if (!req.file) {
        const error = new Error('No image provided')
        error.statusCode = 422
        throw error
    }

    const imageUrl = req.file.path
    const {title, content} = req.body
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId,
    })

    try {
        await post.save()
        const user = await User.findById(req.userId)

        await user.posts.push(post)
        await user.save()

        socketIo.getSocket().emit('posts', {
            action: 'create',
            post: {...post._doc, creator: {_id: req.userId, name: user.name}},
        })

        await res.status(201).json({
            message: 'Post was created successfully',
            post,
            creator: {_id: user._id, name: user.name},
        })

        return user
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return
    }
}

export const getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error()
                error.statusCode = 404
                throw error
            }
            res.status(200).json({message: 'post fetched', post})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

export const updatePost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed')
        error.statusCode = 422
        throw error
    }

    const postId = req.params.postId
    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.body.image
    if (req.file) {
        imageUrl = req.file.path
    }
    if (!imageUrl) {
        const error = new Error('No file picked')
        error.statusCode = 422
        throw error
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error()
                error.statusCode = 404
                throw error
            }

            if (post.creator._id.toString() !== req.userId) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }

            post.title = title
            post.content = content
            post.imageUrl = imageUrl
            return post.save()
        })
        .then(result => {
            socketIo.getSocket().emit('posts', {
                action: 'update',
                post: result,
            })
            res.status(200).json({message: 'post updated', post: result})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

export const deletePost = (req, res, next) => {
    const postId = req.params.postId

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error()
                error.statusCode = 404
                throw error
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }

            clearImage(post.imageUrl)
            return post.remove()
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.pull(postId)
            return user.save()
        })
        .then(result => {
            socketIo.getSocket().emit('posts', {
                action: 'delete',
                post: postId,
            })
            res.status(200).json({message: 'Post deleted'})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}
