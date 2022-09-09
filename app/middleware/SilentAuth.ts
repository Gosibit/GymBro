import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const SilentAuth = function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    if (!process.env.ACCESS_TOKEN_SECRET) throw Error('NO ACCESS TOKEN SECRET')

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return next()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload: any) => {
        if (err) return next()

        const user = await User.findById(payload._id).orFail()

        if (user.passwordChangedDate > payload.iat * 1000)
            return res.status(401).json('Token expired')

        req.user = user
        next()
    })
}

export default SilentAuth
