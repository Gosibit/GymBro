import express from 'express'
import fs from 'fs'
import Product, { Category, Gender } from '../models/Product'
import sharp from 'sharp'
import path from 'path'

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
            const originalPath =
                './public/product-photos/originals/' +
                product._id +
                '.' +
                req.file.mimetype.split('/')[1]
            const thumbnailPath =
                './public/product-photos/thumbnails/' +
                product._id +
                '.' +
                req.file.mimetype.split('/')[1]

            product.imageUrls = {
                original: process.env.ADDRESS + originalPath.replace('.', ''),
                thumbnail: process.env.ADDRESS + thumbnailPath.replace('.', ''),
            }
            await product.save()
            const thumbnailBuffer = await sharp(req.file.buffer).resize(80).toBuffer()
            fs.createWriteStream(originalPath).write(req.file.buffer)
            fs.createWriteStream(thumbnailPath).write(thumbnailBuffer)
            return res.status(201).json({ product })
        } catch (error) {
            console.log(error)
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
            const products = await Product.find({ category, gender }).limit(parseInt(limit))
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
    public async destroy(req: express.Request, res: express.Response) {
        try {
            if (!process.env.ADDRESS) throw Error('No env address')
            const product = await Product.findById(req.params._id).orFail()
            product.delete()
            fs.unlink(product.imageUrls.original.replace(process.env.ADDRESS, '.'), () => {})
            fs.unlink(product.imageUrls.thumbnail.replace(process.env.ADDRESS, '.'), () => {})
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
                const originalPath = product.imageUrls.original.replace(process.env.ADDRESS, '.')
                const thumbnailPath = product.imageUrls.thumbnail.replace(process.env.ADDRESS, '.')
                const thumbnailBuffor = await sharp(req.file.buffer).resize(80, 100)
                fs.createWriteStream(originalPath).write(req.file.buffer)
                fs.createWriteStream(thumbnailPath).write(thumbnailBuffor)
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
