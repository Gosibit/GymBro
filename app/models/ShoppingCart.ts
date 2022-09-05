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
}

const ShoppingCartSchema = new Schema<IShoppingCart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
    { timestamps: true }
)
ShoppingCartSchema.index({ createdOn: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 10 }) //10 days

const ShoppingCart = mongoose.model<IShoppingCart>('ShoppingCart', ShoppingCartSchema)

export default ShoppingCart
