import dotenv = require('dotenv')
import express from 'express'
import userRoutes from './app/routes/userRoutes'
import authRoutes from './app/routes/authRoutes'
import productRoutes from './app/routes/productRoutes'
import shoppingCartRoutes from './app/routes/shoppingCartRoutes'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import path = require('path')

const app = express()
app.use(cors())

dotenv.config()
const port = process.env.PORT || 3000
const dbURI = `mongodb+srv://${process.env.MONGODB_USER_LOGIN}:${process.env.MONGODB_USER_PASSWORD}@gymbro.ablfct2.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
;(async () => {
    try {
        await mongoose.connect(dbURI, {})
        app.listen(port, () => console.log(`Listening on port ${port}`))
        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            next()
        })
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use('/users', userRoutes)
        app.use('/auth/', authRoutes)
        app.use('/products/', productRoutes)
        app.use('/shopping-carts/', shoppingCartRoutes)
    } catch (error) {}
})()
