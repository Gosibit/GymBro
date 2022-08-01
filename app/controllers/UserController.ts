import User from '../models/User'
class UserController {
    public async register(req: any, res: any) {
        try {
            const user = new User(req.body)
            await user.save()
            res.status(201).json(user)
        } catch (error) {
            console.log(error)
            res.status(422).json({
                status: 'error',
                message: error,
            })
        }
    }
}
export default new UserController()
