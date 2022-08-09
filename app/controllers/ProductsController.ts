import express from 'express'
import fs from 'fs'
import Product, { Category, Gender } from '../models/Product'

class ProductsController {
    public async store(req: express.Request, res: express.Response) {
        try {
            if (!req.file) throw Error('no file')
            const { title, description, category, gender } = req.body

            const product = await Product.create({
                title,
                description,
                category,
                gender,
            })
            const path =
                './public/product-photos/' + product._id + '.' + req.file.mimetype.split('/')[1]
            product.imageUrl = process.env.ADDRESS + path.replace('.', '')
            await product.save()
            fs.createWriteStream(path).write(req.file.buffer)
            return res.status(201).json({ product })
        } catch (error) {
            console.log(error)
            return res.status(422).json('There was a problem with creating product')
        }
    }
    public async search(req: express.Request, res: express.Response) {
        try {
            const { category = Object.values(Category), gender = Object.values(Gender) } = req.query //if some params not provided accept every possible value of this param
            console.log(req.params)
            const products = await Product.find({ category, gender })
            return res.status(400).json(products)
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
            return res.status(400).json(products)
        } catch (error) {
            return res.status(422).json('There was a problem with finding products')
        }
    }
    public async destroy(req: express.Request, res: express.Response) {
        try {
            if (!process.env.ADDRESS) throw Error('No env address')
            const product = await Product.findById(req.params._id).orFail()
            product.delete()
            fs.unlink(product.imageUrl.replace(process.env.ADDRESS, '.'), () => {})
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
                const path = product.imageUrl.replace(process.env.ADDRESS, '.')
                fs.createWriteStream(path).write(req.file.buffer)
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
