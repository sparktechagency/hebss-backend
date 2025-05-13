import mongoose from 'mongoose';
import { ISubscriptionPurchase } from './subscriptionPurchase.interface';

const subscriptionPurchaseSchema = new mongoose.Schema<ISubscriptionPurchase>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', unique: true, required: true },
    subscription: { 
        id: {
            type: String, required: true
        },
        priceId: {
            type: String,
            required: true
        }
     },
    paymentType: {
      type: String,
      enum: ['card', 'cash', 'online'],
      required: true,
    },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    isActive: { type: Boolean, default: true },
    // paymentSource: {
    //   number: { type: String, required: true },
    //   tnxId: { type: String, required: true },
    //   type: {
    //     type: String,
    //     enum: ['visa', 'mastercard', 'amex', 'other'],
    //     required: true,
    //   },
    //   name: { type: String },
    //   isSaved: { type: Boolean, default: false },
    // },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ISubscriptionPurchase>('subscriptionPurchase', subscriptionPurchaseSchema);
