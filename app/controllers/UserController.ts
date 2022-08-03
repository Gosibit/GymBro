import User from '../models/User'
import authController from './AuthController'
class UserController {
    public async register(req: any, res: any) {
        try {
            const { login, email, password, firstName, lastName } = req.body
            const user = await User.create({
                login,
                email,
                password,
                firstName,
                lastName,
                confirmed: false,
            })

            authController.send_verify_email(user.toJSON())

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
}
export default new UserController()
