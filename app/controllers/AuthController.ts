import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'
import express from 'express'
class AuthController {
    static sendVerifyEmail(user: IUser) {
        const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_SECRET, ADDRESS } = process.env
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
                const url = `${ADDRESS}/auth/confirmation/${emailToken}`
                transporter.sendMail({
                    to: user.email,
                    from: `GymBro <${EMAIL_USERNAME}>`,
                    subject: 'Confirm Email',
                    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
                })
            }
        )
    }
    public async resendVerifyEmail(req: express.Request, res: express.Response) {
        try {
            if (!req.body.email) throw Error()
            const user = await User.findOne({ email: req.body.email }).orFail()
            if (user && !user.confirmed) AuthController.sendVerifyEmail(user)
            return res.status(200).json({ message: 'Email sent if possible' })
        } catch (error) {
            console.log(error)
            return res.status(200).json({ message: 'Email sent if possible' })
        }
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
    public createAccessToken(user: IUser) {
        if (!process.env.ACCESS_TOKEN_SECRET) throw Error('NO ACCESS TOKEN SECRET')
        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '2d',
        })
        return accessToken
    }

    public async resetPasswordRequest(req: express.Request, res: express.Response) {
        try {
            if (!req.body.email) throw Error()

            const user = await User.findOne({ email: req.body.email }).orFail()
            const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, CHANGE_PASSWORD_SECRET, ADDRESS } =
                process.env
            if (!CHANGE_PASSWORD_SECRET) throw Error('NO CHANGE PASSWORD SECRET')

            let transporter = nodemailer.createTransport({
                host: EMAIL_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: EMAIL_USERNAME,
                    pass: EMAIL_PASSWORD,
                },
            })
            jwt.sign(
                { userId: user._id },
                CHANGE_PASSWORD_SECRET,
                { expiresIn: '1d' },
                async (err, changePasswordToken) => {
                    const url = `${ADDRESS}/auth/change-password/${changePasswordToken}` //its gonna be FE address
                    transporter.sendMail({
                        to: user.email,
                        from: `GymBro <${EMAIL_USERNAME}>`,
                        subject: 'Change Password',
                        html: `Somebody asked to change password on your account, if it was not you feel free to ignore this message<p>Change Password:<a href="${url}">${url}</a></p>`,
                    })
                }
            )
            return res.status(200).json({
                message: 'Email sent if user exists',
            })
        } catch (error) {
            console.log(error)
            return res.status(200).json({
                message: 'Email sent if user exists',
            })
        }
    }
    public async resetPassword(req: express.Request, res: express.Response) {
        try {
            if (!req.body.password || !req.body.token || !process.env.CHANGE_PASSWORD_SECRET)
                throw Error('wrong data')

            const jwtPayload: any = jwt.verify(req.body.token, process.env.CHANGE_PASSWORD_SECRET)
            const user = await User.findById(jwtPayload.userId).orFail()
            user.password = req.body.password
            user.passwordChangedDate = Date.now()
            await user.save()
            return res.status(200).json('Password changed successfully')
        } catch (error) {
            console.log(error)
            return res.status(422).json({
                message: 'Changing password failed',
            })
        }
    }
}
export default AuthController
