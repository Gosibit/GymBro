import express from 'express'
import AuthController from '../controllers/AuthController'

const router = express.Router()
const authController = new AuthController()
router.get('/confirmation/:token', authController.verifyEmail)
router.post('/reset-password-request', authController.resetPasswordRequest)
router.post('/resend-verify-email', authController.resendVerifyEmail)
router.post('/reset-password', authController.resetPassword)

export default router
