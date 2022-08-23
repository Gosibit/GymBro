import mongoose, { Schema, Document, Model } from 'mongoose'

export enum Category {
    TSHIRTS = 'T-Shirts',
    ACCESORIES = 'Accessories',
}

export enum Gender {
    MEN = 'Men',
    WOMEN = 'Women',
    UNISEX = 'Unisex',
}

export interface IProduct extends Document {
    title: String
    description: String
    price: Number
    gender: Gender
    category: Category
    imageUrls: {
        original: String
        thumbnail: String
    }
}

const productSchema = new Schema<IProduct>({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: Object.values(Gender),
    },
    category: {
        type: String,
        required: true,
        enum: Object.values(Category),
    },
    imageUrls: {
        original: {
            type: String,
            match: new RegExp(/([/|.|\w|\s|-])*\.(?:jpg|png|jpeg)/),
        },
        thumbnail: {
            type: String,
            match: new RegExp(/([/|.|\w|\s|-])*\.(?:jpg|png|jpeg)/),
        },
    },
})

const Product = mongoose.model<IProduct>('Product', productSchema)

export default Product
