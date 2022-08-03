import express from 'express'
import authController from '../controllers/AuthController'

const router = express.Router()

router.use((req: any, res: any, next: any) => {
    console.log('xd')
    console.log(`${req.url}:  ${Date.now()}`)
    next()
})

router.get('/confirmation/:token', authController.verifyEmail)

export default router
