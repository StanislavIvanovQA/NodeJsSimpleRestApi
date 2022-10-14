import {expect} from 'chai'
import sinon from 'sinon'
import {User} from '../models/user.js'
import * as FeedController from '../controllers/feed.js'
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import {socketIo} from '../socket.js'

dotenv.config()

describe('Feed Controller', async () => {
    let user

    before(async () => {
        const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t1icl.mongodb.net/test-messages?retryWrites=true&w=majority`
        await mongoose.connect(mongoUri)

        user = new User({
            email: 'test@test.com',
            name: 'test',
            password: 'testpass',
            posts: [],
        })
        await user.save()

        sinon.stub(socketIo, 'getSocket')
        socketIo.getSocket.returns({
            emit: () => {
            },
        })

        return
    })

    after(async () => {
        await User.deleteMany({})
        await mongoose.disconnect()
        socketIo.getSocket.restore()
        return
    })

    it('should add created posts to the posts of the creator', async () => {
        const req = {
            body: {
                title: 'Test post',
                content: 'A test post',
            },
            file: {
                path: 'qwe',
            },
            userId: user._id,
        }
        const res = {
            status: function () {
                return this
            },
            json: function () {
            },
        }

        const savedUser = await FeedController.postPost(req, res, () => {
        })

        expect(savedUser).to.have.property('posts')
        expect(savedUser.posts).to.have.length(1)
    })
})
