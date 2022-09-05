import express from 'express'
import UsersController from '../controllers/UsersController'
import Authentication from '../middleware/authenticate'

const usersController = new UsersController()
const router = express.Router()

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.get('/me', Authentication, usersController.me)

export default router
