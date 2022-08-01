import dotenv = require('dotenv')
import express from 'express'
import userRoutes from './app/routes/userRoutes'
import bodyParser from 'body-parser'

dotenv.config()

const app = express()
const port = process.env.PORT
import User from './app/models/User'
import mongoose from 'mongoose'

const dbURI = `mongodb+srv://${process.env.MONGODB_USER_LOGIN}:${process.env.MONGODB_USER_PASSWORD}@gymbro.ablfct2.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`

async function run() {
    try {
        await mongoose.connect(dbURI, {})
        app.listen(port, () => console.log(`Listening on port ${port}`))
    } catch (error) {
        console.log(error)
    }
}
;(async () => {
    await run().catch(console.dir)
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use('/user', userRoutes)
})()
