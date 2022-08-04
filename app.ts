import dotenv = require('dotenv')
import express from 'express'
import userRoutes from './app/routes/userRoutes'
import authRoutes from './app/routes/authRoutes'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import User from './app/models/User'
import jwt from 'jsonwebtoken'
// import authenticateAccessToken from './app/middleware/authenticate'

const app = express()
dotenv.config()
const port = process.env.PORT
const dbURI = `mongodb+srv://${process.env.MONGODB_USER_LOGIN}:${process.env.MONGODB_USER_PASSWORD}@gymbro.ablfct2.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
const authenticateAccessToken = function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    if (!process.env.ACCESS_TOKEN_SECRET) throw Error('NO ACCESS TOKEN SECRET')
    console.log('łe')
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.status(401).json('Authentication Failed')
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
        if (err) return res.status(401).json('Authentication Failed')
        req.body = user
    })
    next()
}
;(async () => {
    try {
        await mongoose.connect(dbURI, {})
        //await User.deleteMany({})
        app.listen(port, () => console.log(`Listening on port ${port}`))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use('/user', userRoutes)
        app.use(authenticateAccessToken)
        app.use('/auth/', authRoutes)
    } catch (error) {
        console.log(error)
    }
})()
