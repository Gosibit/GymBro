import express from 'express'
import userController from '../controllers/UserController'

const router = express.Router()

router.use((req: any, res: any, next: any) => {
    console.log(`${req.url}:  ${Date.now()}`)
    next()
})

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/resend-verify-email', userController.resendVerifyEmail)

export default router
