import mongoose, { Schema, Document, Model, ObjectId, Types, PopulatedDoc } from 'mongoose'
import { IProduct } from './Product'
import { IUser } from './User'

export enum Size {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL',
}

export interface IShoppingCartProduct {
    product: PopulatedDoc<IProduct>
    quantity: number
    size: Size
}

export interface IShoppingCart extends Document {
    products: IShoppingCartProduct[]
    user: PopulatedDoc<IUser>
    total:string
}

const ShoppingCartSchema = new Schema<IShoppingCart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        total:{
            type: String,
            required: false,
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                size: {
                    type: String,
                    enum: Object.values(Size),
                },
            },
        ],
    },
)

ShoppingCartSchema.pre('save', async function (next) {
    this.total = this.products.reduce((acc, product) => acc + product.product.price * product.quantity, 0).toFixed(2)
    this.products.forEach((product) => {
       // console.log(product)
    })
    return next()
})

const ShoppingCart = mongoose.model<IShoppingCart>('ShoppingCart', ShoppingCartSchema)


export default ShoppingCart
