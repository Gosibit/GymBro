import streamifier = require('streamifier')
import dotenv = require('dotenv')
dotenv.config()

class Cloudinary {
    cloudinary: any
    constructor() {
        this.cloudinary = require('cloudinary').v2

        this.cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }
    async upload(file: Buffer) {
        return new Promise((resolve, reject) => {
            const cld_upload_stream = this.cloudinary.uploader.upload_stream(
                { folder: 'gymbro' },
                (err: any, result: any) => {
                    if (err) return reject(err)
                    return resolve(result)
                }
            )
            streamifier.createReadStream(file).pipe(cld_upload_stream)
        })
    }
    async destroy(public_id: String) {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.destroy(public_id, (err: any, result: any) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}
export default new Cloudinary()
