import dotenv = require('dotenv')
import express from 'express'
import userRoutes from './app/routes/userRoutes'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
const app = express()
dotenv.config()
const port = process.env.PORT
const dbURI = `mongodb+srv://${process.env.MONGODB_USER_LOGIN}:${process.env.MONGODB_USER_PASSWORD}@gymbro.ablfct2.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`

;(async () => {
    try {
        await mongoose.connect(dbURI, {})
        app.listen(port, () => console.log(`Listening on port ${port}`))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use('/user', userRoutes)
    } catch (error) {
        console.log(error)
    }
})()
