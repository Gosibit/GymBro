import mongoose, { Schema, Document, Model } from 'mongoose'

export enum Category {
    TSHIRTS = 'T-Shirts',
    ACCESORIES = 'Accessories',
}

export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
    UNISEX = 'U',
}

export interface IProduct extends Document {
    title: String
    description: String
    price: Number
    gender: Gender
    category: Category
    imageUrls: {
        original: {
            publicId: String
            url: String
        }
        thumbnail: {
            publicId: String
            url: String
        }
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
            publicId: {
                type: String,
            },
            url: {
                type: String,
                match: new RegExp(/([/|.|\w|\s|-])*\.(?:jpg|png|jpeg)/),
            },
        },
        thumbnail: {
            publicId: {
                type: String,
            },
            url: {
                type: String,
                match: new RegExp(/([/|.|\w|\s|-])*\.(?:jpg|png|jpeg)/),
            },
        },
    },
})

const Product = mongoose.model<IProduct>('Product', productSchema)

export default Product
