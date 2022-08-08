import User from '../models/User'
import AuthController from './AuthController'
import express from 'express'
import jwt from 'jsonwebtoken'

class UserController {
    public async register(req: express.Request, res: express.Response) {
        try {
            const { login, username, email, password, firstName, lastName } = req.body
            const user = await User.create({
                login,
                username,
                email,
                password,
                firstName,
                lastName,
                confirmed: false,
            })

            AuthController.sendVerifyEmail(user)

            return res.status(201).json({
                message: 'User successfully created',
                user: user.login,
            })
        } catch (error) {
            console.log(error)
            return res.status(422).json({
                message: 'There was an error while creating new user',
            })
        }
    }
    public async login(req: express.Request, res: express.Response) {
        try {
            const user = await User.findOne({ login: req.body.login }).orFail()
            const validate = await user.validatePassword(req.body.password)
            if (!validate) throw Error('Wrong password')
            if (!user.confirmed)
                return res.status(401).json({
                    message: 'Email not verified',
                })
            const authController = new AuthController()
            const accessToken = authController.createAccessToken(user)
            return res.status(200).json({
                message: 'User successfully logged in',
                accessToken: accessToken,
            })
        } catch (error) {
            console.log(error)
            return res.status(422).json({
                message: 'There was an error while logging in',
            })
        }
    }
}
export default UserController
