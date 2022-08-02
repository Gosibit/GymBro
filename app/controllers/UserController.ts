import User from '../models/User'
class UserController {
    public async register(req: any, res: any) {
        try {
            // const user = new User(req.body)
            // await user.save()
            const user = await User.create(req.body)
            const createdUser = (({ password, ...rest }) => rest)(user.toJSON()) //return everything except password as JSON

            res.status(201).json({
                message: 'User successfully created',
                user: createdUser,
            })
        } catch (error) {
            console.log(error)
            res.status(422).json({
                message: 'There was an error while creating new user',
            })
        }
    }
}
export default new UserController()
