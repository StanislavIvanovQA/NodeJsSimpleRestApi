import {User} from '../models/user.js'
import {validationResult} from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const signup = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                name,
                password: hashedPassword,
            })
            return user.save()
        })
        .then(result => {
            res.status(201).json({message: 'UserCreated', userId: result._id})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

export const login = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        let existingUser

        const user = await User.findOne({email})

        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        }

        const isEqual = await bcrypt.compare(password, user.password)

        if (!isEqual) {
            const error = new Error('Incorrect password')
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign({
                email: user.email,
                userId: user._id.toString(),
            },
            process.env.TOKEN_SECRET,
            {expiresIn: '1h'})
        res.status(200).json({token, userId: existingUser._id.toString()})
        return
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        return err
    }
}

export const getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({status: user.status})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

export const updateUserStatus = (req, res, next) => {
    const newStatus = req.body.status
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found')
                error.statusCode = 404
                throw error
            }
            user.status = newStatus
            return user.save()
        })
        .then(result => {
            res.status(200).json({message: 'user status changed successfully'})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}
