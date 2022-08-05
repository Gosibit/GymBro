import dotenv = require('dotenv')
import express from 'express'
import userRoutes from './app/routes/userRoutes'
import authRoutes from './app/routes/authRoutes'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import User from './app/models/User'

const app = express()
dotenv.config()
const port = process.env.PORT
const dbURI = `mongodb+srv://${process.env.MONGODB_USER_LOGIN}:${process.env.MONGODB_USER_PASSWORD}@gymbro.ablfct2.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
;(async () => {
    try {
        await mongoose.connect(dbURI, {})
        // await User.deleteMany({})
        app.listen(port, () => console.log(`Listening on port ${port}`))
        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.log(req.url)
            next()
        })
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use('/user', userRoutes)
        app.use('/auth/', authRoutes)
    } catch (error) {
        console.log(error)
    }
})()
