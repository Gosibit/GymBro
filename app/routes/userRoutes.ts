import express from 'express'
import userController from '../controllers/UserController'

const router = express.Router()

router.use((req: any, res: any, next: any) => {
    console.log(`${req.url}:  ${Date.now()}`)
    next()
})

router.post('/register', userController.register) //multer to parse multipart/form-data

export default router
