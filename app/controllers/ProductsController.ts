import express from 'express'
import fs from 'fs'
import Product, { Category, Gender } from '../models/Product'
import sharp from 'sharp'
import cloudinary from '../services/Cloudinary'
class ProductsController {
    public async store(req: express.Request, res: express.Response) {
        try {
            if (!req.file) throw Error('no file')
            const { title, description, category, gender, price } = req.body

            const product = await Product.create({
                title,
                description,
                category,
                gender,
                price,
            })

            const originalBuffer = req.file.buffer
            const thumbnailBuffer = await sharp(req.file.buffer).resize(80).toBuffer()

            const originalUpload: any = await cloudinary.upload(originalBuffer)
            const thumbnailUpload: any = await cloudinary.upload(thumbnailBuffer)

            product.imageUrls.original.publicId = originalUpload.public_id
            product.imageUrls.original.url = originalUpload.url

            product.imageUrls.thumbnail.publicId = thumbnailUpload.public_id
            product.imageUrls.thumbnail.url = thumbnailUpload.url
            await product.save()

            return res.status(201).json({ product })
        } catch (error) {
            return res.status(422).json('There was a problem with creating product')
        }
    }
    public async search(req: express.Request, res: express.Response) {
        try {
            const {
                category = Object.values(Category),
                gender = Object.values(Gender),
                limit = 1000,
            }: any = req.query //if some params not provided accept every possible value of this param
            const products = await Product.find({
                category,
                gender: gender.length === 3 ? gender : [gender, Gender.UNISEX],
            }).limit(parseInt(limit))
            return res.status(200).json(products)
        } catch (error) {
            return res.status(422).json('There was a problem with finding products')
        }
    }
    public async searchBarQuery(req: express.Request, res: express.Response) {
        try {
            const { title = '' } = req.query //if some params not provided accept every possible value of this param
            const products = await Product.find({
                title: { $regex: title + '.*', $options: 'i' },
            }).limit(5)
            return res.status(200).json(products)
        } catch (error) {
            return res.status(422).json('There was a problem with finding products')
        }
    }
    public async show(req: express.Request, res: express.Response) {
        try {
            const product = await Product.findById(req.params._id).orFail()
            return res.status(200).json(product)
        } catch (error) {
            return res.status(422).json('There was a problem with finding product')
        }
    }
    public async destroy(req: express.Request, res: express.Response) {
        try {
            if (!process.env.ADDRESS) throw Error('No env address')
            const product = await Product.findById(req.params._id).orFail()
            product.delete()
            cloudinary.destroy(product.imageUrls.original.publicId)
            cloudinary.destroy(product.imageUrls.thumbnail.publicId)
            return res.status(200).json('Product deleted successfully')
        } catch (error) {
            return res.status(422).json('There was a problem with deleting product')
        }
    }
    public async update(req: express.Request, res: express.Response) {
        try {
            const { title, description, category, gender } = req.body
            const product = await Product.findOneAndUpdate(
                { _id: req.body._id },
                { title, description, category, gender },
                { runValidators: true }
            ).orFail()

            if (req.file) {
                if (!process.env.ADDRESS) throw Error('No env address')
                const originalBuffer = req.file.buffer
                const thumbnailBuffer = await sharp(req.file.buffer).resize(80).toBuffer()

                const originalUpload: any = await cloudinary.upload(originalBuffer)
                const thumbnailUpload: any = await cloudinary.upload(thumbnailBuffer)

                await cloudinary.destroy(product.imageUrls.original.publicId)
                await cloudinary.destroy(product.imageUrls.thumbnail.publicId)

                product.imageUrls.original.publicId = originalUpload.public_id
                product.imageUrls.original.url = originalUpload.url

                product.imageUrls.thumbnail.publicId = thumbnailUpload.public_id
                product.imageUrls.thumbnail.url = thumbnailUpload.url
                await product.save()
            }
            return res.status(200).json(product)
        } catch (error) {
            console.log(error)
            return res.status(422).json('There was a problem with updating product')
        }
    }
}

export default ProductsController
