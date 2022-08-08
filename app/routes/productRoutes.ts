import express from 'express'
import ProductController from '../controllers/ProductController'
import multer from 'multer'

const productController = new ProductController()
const router = express.Router()

const upload = multer({
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == 'image/png' ||
            file.mimetype == 'image/jpg' ||
            file.mimetype == 'image/jpeg'
        )
            cb(null, true)
        else cb(null, false)
    },
})

router.post('/store', upload.single('image'), productController.store)

export default router
