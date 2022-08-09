import express from 'express'
import UsersController from '../controllers/UsersController'

const usersController = new UsersController()
const router = express.Router()

router.post('/register', usersController.register)
router.post('/login', usersController.login)

export default router
