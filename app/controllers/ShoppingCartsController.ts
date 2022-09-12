import express from 'express'
import ShoppingCart, { IShoppingCart } from '../models/ShoppingCart'
import { ObjectId } from 'mongodb'
import Stripe, {PaymentMethods,Deliveries, getDelivery} from '../services/Stripe'

async function cartQuery(param: any) {
    return await ShoppingCart.findOne(param).populate('products.product').orFail()
}

function findProductIndex(cart: IShoppingCart, productId: string, size: string) {
    return cart.products.findIndex(
        (SCproduct) => SCproduct.product._id.toString() === productId && SCproduct.size === size
    )
}

function validatePaymentMethod (paymentMethod: string) {
    return Object.values(PaymentMethods).includes(paymentMethod as PaymentMethods)
}

class ShoppingCartsController {
    public async getCart(req: express.Request, res: express.Response) {
        try {
        
            if (!req.query.shoppingCartId && !req.user) throw Error('No shopping cart id')

            let cart: IShoppingCart

            if (req.user) {
                cart = await cartQuery({ user: req.user._id })
            } else {
                cart = await cartQuery({ _id: req.query.shoppingCartId })
            }
            await cart.save()
            return res.status(200).json(cart)
        } catch (error) {
            console.log(error)
            return res.status(422).json({ message: 'There was an error while getting cart' })
        }
    }
    public async addToCart(req: express.Request, res: express.Response) {
        try {
            let cart: IShoppingCart

            if (!req.body.shoppingCartId && !req.user) {
                cart = await ShoppingCart.create({ products: [] })
            } else if (req.user) {
                cart = await cartQuery({ user: req.user._id })
            } else {
                cart = await cartQuery({ _id: req.body.shoppingCartId })
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
            
            const populatedCart = await cartQuery({ _id: cart._id })

            await populatedCart.save()

            return res.status(200).json(populatedCart)
        } catch (error) {
            console.log(error)
            return res.status(422).json({ message: 'There was an error while adding to cart' })
        }
    }
    public async removeFromCart(req: express.Request, res: express.Response) {
        try {
            if (!req.query.shoppingCartId && !req.user) throw Error('No shopping cart id')

            let cart: IShoppingCart
            if (req.user) cart = await cartQuery({ user: req.user._id })
            else cart = await cartQuery({ _id: req.query.shoppingCartId })

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
            if (!req.body.shoppingCartId && !req.user) throw Error('No shopping cart id')

            let cart: IShoppingCart

            if (req.user) cart = await cartQuery({ user: req.user._id })
            else cart = await cartQuery({ _id: req.body.shoppingCartId })

            const { productId, quantity, size } = req.body
            if (!productId || !quantity || parseInt(quantity) != quantity || !size)
                throw Error('No product id or quantity or size')

            const productIndex = findProductIndex(cart, productId, size)
            if (productIndex === -1) throw Error('Product is not in cart')

            quantity <= 0
                ? cart.products.splice(productIndex, 1) //if quantity is 0 or less, remove product from cart
                : (cart.products[productIndex].quantity = quantity) //if quantity is more than 0, update quantity

            await cart.save()
            const populatedCart = await cartQuery({ _id: cart._id })
            return res.status(200).json(populatedCart)
        } catch (error) {
            return res.status(422).json({ message: 'There was an error while updating cart' })
        }
    }
    public async checkout(req: express.Request, res: express.Response) {
    
        try {
            const { shoppingCartId, paymentMethod, deliveryMethod } = req.body

            if (!shoppingCartId && !req.user) throw Error('No shopping cart id')
            if(!validatePaymentMethod(paymentMethod)) throw Error('Invalid payment method')
            
            const delivery = getDelivery(deliveryMethod)
            
            let cart: IShoppingCart
            
            if (req.user) cart = await cartQuery({ user: req.user._id })
            else cart = await cartQuery({ _id: req.body.shoppingCartId })
            
            if(cart.products.length === 0) throw Error('Cart is empty')

            const stripe = new Stripe()

            const session = await stripe.createCheckoutSession(cart,paymentMethod,delivery)

            cart.products = []
            await cart.save()
            
            return res.status(200).json({ url: session.url,shoppingCart: cart })
        } catch (error) {
            console.log(error)
            return res.status(422).json({ message: 'There was an error while creating checkout session' })
        }
    }
}
    

export default ShoppingCartsController
