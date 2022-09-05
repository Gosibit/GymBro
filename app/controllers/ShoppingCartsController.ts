import express from 'express'
import ShoppingCart, { IShoppingCart } from '../models/ShoppingCart'
import { ObjectId } from 'mongodb'

async function cartQuery(param: any) {
    return await ShoppingCart.findOne(param).populate('products.product').orFail()
}

function findProductIndex(cart: IShoppingCart, productId: string, size: string) {
    return cart.products.findIndex(
        (SCproduct) => SCproduct.product._id.toString() === productId && SCproduct.size === size
    )
}

class ShoppingCartsController {
    public async getCart(req: express.Request, res: express.Response) {
        try {
            if (!req.params.shoppingCartId && !req.user) throw Error('No shopping cart id')

            let cart: IShoppingCart

            if (req.user) {
                cart = await ShoppingCart.findOne({ user: req.user._id })
                    .populate('products.product')
                    .orFail()
            } else {
                cart = await ShoppingCart.findOne({ user: req.user._id })
                    .populate('product')
                    .orFail()
            }

            const total = cart.products.reduce((acc, SCproduct) => {
                // sc = shopping cart
                return acc + SCproduct.product.price * SCproduct.quantity
            }, 0)
            return res.status(200).json({ ...cart.toJSON(), total })
        } catch (error) {
            console.log(error)
            return res.status(422).json({ message: 'There was an error while getting cart' })
        }
    }
    public async addToCart(req: express.Request, res: express.Response) {
        try {
            let cart: IShoppingCart

            if (!req.params.shoppingCartId && !req.user) {
                cart = await ShoppingCart.create({ products: [] })
                cart = await cart.populate('products.product')
            } else if (req.user) {
                cart = await cartQuery({ user: req.user._id })
            } else {
                cart = await cartQuery({ _id: req.params.shoppingCartId })
            }

            const { productId, quantity, size } = req.body
            if (!productId || !quantity || parseInt(quantity) != quantity || !size) {
                throw Error('No product id or quantity or size')
            }

            const productIndex = findProductIndex(cart, productId, size)
            if (productIndex === -1) {
                cart.products.push({ product: productId, quantity: parseInt(quantity), size: size })
            } else {
                cart.products[productIndex].quantity += parseInt(quantity)
            }

            await cart.save()
            return res.status(200).json(cart)
        } catch (error) {
            console.log(error)
            return res.status(422).json({ message: 'There was an error while adding to cart' })
        }
    }
    public async removeFromCart(req: express.Request, res: express.Response) {
        try {
            if (!req.params.shoppingCartId && !req.user) throw Error('No shopping cart id')

            let cart: IShoppingCart
            if (req.user) cart = await cartQuery({ user: req.user._id })
            else cart = await cartQuery({ _id: req.params.shoppingCartId })

            const { productId, size } = <any>req.query
            if (!productId || !size) throw Error('No product id or size')

            const productIndex = findProductIndex(cart, productId, size)
            if (productIndex === -1) throw Error('Product not in cart')

            cart.products.splice(productIndex, 1)

            await cart.save()
            return res.status(200).json(cart)
        } catch (error: any) {
            return res.status(422).json({ message: error.message })
        }
    }
    public async updateCart(req: express.Request, res: express.Response) {
        try {
            if (!req.params.shoppingCartId && !req.user) throw Error('No shopping cart id')

            let cart: IShoppingCart

            if (req.user) cart = await cartQuery({ user: req.user._id })
            else cart = await cartQuery({ _id: req.params.shoppingCartId })

            const { productId, quantity, size } = req.body
            if (!productId || !quantity || parseInt(quantity) != quantity || !size)
                throw Error('No product id or quantity or size')

            const productIndex = findProductIndex(cart, productId, size)
            if (productIndex === -1) throw Error('Product is not in cart')

            quantity <= 0
                ? cart.products.splice(productIndex, 1) //if quantity is 0 or less, remove product from cart
                : (cart.products[productIndex].quantity = quantity) //if quantity is more than 0, update quantity

            await cart.save()
            return res.status(200).json(cart)
        } catch (error) {
            return res.status(422).json({ message: 'There was an error while updating cart' })
        }
    }
}

export default ShoppingCartsController
