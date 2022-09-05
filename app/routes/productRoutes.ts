import express from 'express'
import ProductsController from '../controllers/ProductsController'
import multer from 'multer'
import Auth from '../middleware/Auth'

import Admin from '../middleware/Admin'

const productController = new ProductsController()
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

router.post('/store', [Auth, Admin, upload.single('image')], productController.store)
router.get('/search', productController.search)
router.get('/search-bar-query', productController.searchBarQuery)
router.delete('/:_id', [Auth, Admin], productController.destroy)
router.put('/', [Auth, Admin, upload.single('image')], productController.update)
router.get('/:_id', productController.show)

export default router
