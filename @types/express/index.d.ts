import User from '../../app/models/User'

declare global {
    namespace Express {
        interface Request {
            currentUser: User
        }
    }
}
