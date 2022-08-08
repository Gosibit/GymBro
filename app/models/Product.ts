import mongoose, { Schema, Document, Model } from 'mongoose'

enum Category {
    TSHIRTS = 'T-Shirts',
    ACCESORIES = 'Accessories',
}

export interface IProduct extends Document {
    title: String
    description: String
    category: Category
    imageUrl: String
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
    },
    category: {
        type: String,
        required: true,
        enum: Object.values(Category),
    },
    imageUrl: {
        type: String,
        match: new RegExp(/([/|.|\w|\s|-])*\.(?:jpg|png|jpeg)/),
    },
})

const Product = mongoose.model<IProduct>('Product', productSchema)

export default Product
