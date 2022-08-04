import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import express from 'express'
import { response } from 'express'

class AuthController {
    public send_verify_email(user: any) {
        const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_SECRET, ADDRESS, PORT } =
            process.env
        if (!EMAIL_SECRET) throw Error('NO EMAIL SECRET')

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
            EMAIL_SECRET,
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
    public async resend_verify_email(email: string) {
        const user: any = await User.findOne({ email })
        if (!user || user.confirmed) return
        this.send_verify_email(user.toJSON())
        return
    }
    public async verifyEmail(req: express.Request, res: express.Response) {
        try {
            if (!process.env.EMAIL_SECRET) throw Error()
            const jwtPayload: any = jwt.verify(req.params.token, process.env.EMAIL_SECRET)
            const user = await User.findById(jwtPayload.id).orFail()
            if (user.confirmed) throw Error()

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
    public createAccessToken(user: any) {
        if (!process.env.ACCESS_TOKEN_SECRET) throw Error('NO ACCESS TOKEN SECRET')
        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' })
        return accessToken
    }
}
export default new AuthController()
