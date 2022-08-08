import express from 'express'
import fs from 'fs'
import Product, { IProduct } from '../models/Product'

class ProductController {
    public async store(req: express.Request, res: express.Response) {
        try {
            if (!req.file) throw Error('no file')
            const { title, description, category } = req.body

            const product = await Product.create({
                title,
                description,
                category,
            })
            const path = `./public/product-photos/${product._id}-${req.file.originalname.replace(
                ' ',
                '-'
            )}`
            product.imageUrl = process.env.ADDRESS + path.replace('.', '')
            await product.save()
            fs.createWriteStream(path).write(req.file.buffer)
            return res.status(201).json({ product })
        } catch (error) {
            console.log(error)
            return res.status(422).json('There was a problem with creating product')
        }
    }
}

export default ProductController
