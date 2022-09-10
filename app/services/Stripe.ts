import { IShoppingCart } from "../models/ShoppingCart";

export enum PaymentMethods {
    CARD = "card",
    ALIPAY = "alipay",
}

export enum Deliveries {
    DHL = "Dhl",
    FEDEX ="Fedex",
}

export interface Delivery {
    name: Deliveries;
    price: number;
}
export function getDelivery (delivery:Deliveries) {
  switch (delivery) {
      case Deliveries.DHL:
          return {name: Deliveries.DHL, price:3.50 }
      case Deliveries.FEDEX:
          return {name: Deliveries.FEDEX, price: 5.50}
      default:
          throw Error('No such delivery')
  }
}

class Stripe {
    stripe:any
  constructor() {
    this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }

    

    async createCheckoutSession (shoppingCart:IShoppingCart,paymentMethod:PaymentMethods,delivery:Delivery) {
       
            const session = await this.stripe.checkout.sessions.create({
              mode: 'payment',
              payment_method_types: [paymentMethod],
              currency: "usd",
              success_url:  process.env.FE_ADDRESS + '/payment-accepted',
              cancel_url:   process.env.FE_ADDRESS + '/payment-canceled',
              line_items: shoppingCart.products.map((SCproduct) => ({
                quantity: SCproduct.quantity,
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: SCproduct.product.title,
                  },
                  unit_amount: SCproduct.product.price * 100,
                }
              })),
              shipping_options: [
                {
                  shipping_rate_data: {
                    display_name: delivery.name,
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: delivery.price* 100,
                      currency: 'usd',
                    },
                  },
                },
              ],
            })
            return session
          }

}

export default Stripe