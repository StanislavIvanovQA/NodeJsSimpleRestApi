import {isAuth} from '../middleware/is-auth.js'
import {expect} from 'chai'
import jwt from 'jsonwebtoken'
import sinon from 'sinon'

describe('auth middleware', () => {
    it('should throw an error if no authorization header is present', () => {
        const req = {
            get: function (headerName) {
                return null
            },
        }

        expect(isAuth.bind(this, req, {}, () => {
        })).to.throw('Not authenticated')
    })

    it('should throw an error if authorization token is only one string', () => {
        const req = {
            get: function (headerName) {
                return 'xyz'
            },
        }
        expect(isAuth.bind(this, req, {}, () => {
        })).to.throw()
    })

    it('should yield userId after decoding a token', () => {
        const req = {
            get: function (headerName) {
                return 'Bearer qweqweqwe'
            },
        }
        sinon.stub(jwt, 'verify')
        jwt.verify.returns({userId: 'qwe'})
        isAuth(
            req,
            {}, () => {
            },
        )
        expect(req).to.have.property('userId', 'qwe')
        expect(jwt.verify.called).to.be.true
        jwt.verify.restore()
    })

    it('should throw an error if the token cannot be verified', () => {
        const req = {
            get: function (headerName) {
                return 'Bearer xyz'
            },
        }
        expect(isAuth.bind(this, req, {}, () => {
        })).to.throw()
    })
})
