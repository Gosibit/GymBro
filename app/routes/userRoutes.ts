import express from 'express'
import UsersController from '../controllers/UsersController'
import Auth from '../middleware/Auth'

const usersController = new UsersController()
const router = express.Router()

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.get('/me', Auth, usersController.me)

export default router
