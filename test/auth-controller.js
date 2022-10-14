import {expect} from 'chai'
import sinon from 'sinon'
import {User} from '../models/user.js'
import * as AuthController from '../controllers/auth.js'
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

describe('Auth Controller - Login', async () => {
    let user;

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
        return
    })

    after(async () => {
        await User.deleteMany({})
        await mongoose.disconnect()
        return
    })

    it('should throw an error with code 500 if accessing database fails', async () => {
        sinon.stub(User, 'findOne')
        User.findOne.throws()

        const req = {
            body: {
                email: 'test@test.com',
                password: 'qwerty',
            },
        }

        const result = await AuthController.login(req, {}, () => {
        })

        User.findOne.restore()

        expect(result).to.be.an('error')
        expect(result).to.have.have.property('statusCode', 500)
    })

    it('should send a response with valid user status for existing user', async () => {
        const req = {userId: user._id}
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code
                return this
            },
            json: function (data) {
                this.userStatus = data.status
            },
        }
        await AuthController.getStatus(req, res, () => {
        })

        expect(res.statusCode).to.eq(200)
        expect(res.userStatus).to.eq('New user')
    })
})
