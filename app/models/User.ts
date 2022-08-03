import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { validate as emailValidator } from 'email-validator'

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        //  unique: true,
        trim: true,
        minLength: 3,
        maxLength: 30,
    },
    email: {
        type: String,
        required: true,
        validate: emailValidator,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        match: new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[a-zA-Z0-9!@$!%*?&]/), //at least:1 small, 1 big character, 1 special character and 1 number
        minLength: 8,
        maxLength: 30,
        select: false,
    },
    confirmed: {
        type: Boolean,
        requried: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 30,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 30,
    },
})
userSchema.pre('save', async function (next) {
    // capitalize first name and last name
    this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase()
    this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase()
    //encrypt password
    if (!this.isModified('password')) return next()

    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
})
userSchema.methods.validatePassword = async function validatePassword(data: string) {
    return bcrypt.compare(data, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
