import express from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

const Auth = function (req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!process.env.ACCESS_TOKEN_SECRET) throw Error('NO ACCESS TOKEN SECRET')

    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.status(401).json('Authentication Failed')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload: any) => {
        if (err) return res.status(401).json('Authentication Failed')

        const user = await User.findById(payload._id).orFail()

        if (user.passwordChangedDate > payload.iat * 1000)
            return res.status(401).json('Token expired')

        req.user = user
        next()
    })
}

export default Auth
