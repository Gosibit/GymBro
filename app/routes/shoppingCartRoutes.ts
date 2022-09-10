import express from 'express'
import ShoppingCartController from '../controllers/ShoppingCartsController'
import SilentAuth from '../middleware/SilentAuth'
const shoppingCartcontroller = new ShoppingCartController()
const router = express.Router()

router.get('/', SilentAuth, shoppingCartcontroller.getCart)
router.post('/add-to-cart', SilentAuth, shoppingCartcontroller.addToCart)
router.delete('/remove-from-cart', SilentAuth, shoppingCartcontroller.removeFromCart)
router.put('/update-cart', SilentAuth, shoppingCartcontroller.updateCart)
router.post('/checkout', SilentAuth, shoppingCartcontroller.checkout)

export default router
