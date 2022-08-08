import express from 'express'
import UserController from '../controllers/UserController'

const userController = new UserController()
const router = express.Router()

router.post('/register', userController.register)
router.post('/login', userController.login)

export default router
