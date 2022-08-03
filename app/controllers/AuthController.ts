import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { response } from 'express'

class AuthController {
    public send_verify_email(user: any) {
        const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, SECRET_KEY, ADDRESS, PORT } =
            process.env
        if (!SECRET_KEY) throw Error()

        let transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: EMAIL_USERNAME,
                pass: EMAIL_PASSWORD,
            },
        })

        return jwt.sign(
            { id: user._id },
            SECRET_KEY,
            { expiresIn: '1d' },
            async (err, emailToken) => {
                const url = `${ADDRESS}:${PORT}/auth/confirmation/${emailToken}`
                transporter.sendMail({
                    to: user.email,
                    from: `GymBro <${EMAIL_USERNAME}>`,
                    subject: 'Confirm Email',
                    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
                })
            }
        )
    }
    public async verifyEmail(req: any, res: any) {
        try {
            if (!process.env.SECRET_KEY) throw Error()
            console.log(req.params.token)
            const jwtPayload: any = jwt.verify(req.params.token, process.env.SECRET_KEY)
            const user = await User.findById(jwtPayload.id)
            if (!user || user.confirmed === true) throw Error()
            user.confirmed = true
            await user.save()
            return res.status(200).json({
                message: 'Email verified!',
            })
        } catch (error) {
            console.log(error)
            return res.status(422).json({
                message: 'There was an error while veryfing email',
            })
        }
    }
}
export default new AuthController()
