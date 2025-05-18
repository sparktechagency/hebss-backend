import mongoose from 'mongoose';
import { IOrder } from './order.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const orderSchema = new mongoose.Schema<IOrder>({
  orderId: { type: String, required: true },
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'book', required: true },
    //   name: { type: String, required: true },
    //   price: { type: Number, required: true },
    //   currency: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  // discount: {
  //   type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  //   amount: { type: Number, default: 0 },
  //   currency: { type: String, default: CURRENCY_ENUM.USD },
  // },
  total: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'failed'], default: 'pending' },
  paymentInfo: {
    type: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    tnxId: { type: String, required: true },
  },
  sessionId: { type: String, required: true },
  returnLabelUrl: { type: String},
  returnTrackingCode: { type: String},
  trackingUrl: { type: String},
});

orderSchema.index({ orderId: 'text' });

const Order = mongoose.model<IOrder>('order', orderSchema);

export default Order;
