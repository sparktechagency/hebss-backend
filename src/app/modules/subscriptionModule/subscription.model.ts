import mongoose from 'mongoose';
import { ISubscription } from './subscription.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const subscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    name: { type: String, required: true },
    price: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: CURRENCY_ENUM.USD },
    },
    type: {
      type: String,
      enum: ['monthly', 'biannually', 'quarterly'],
      required: true,
    },
    features: { type: [String], required: true },
  },
  {
    timestamps: true,
  },
);

const Subscription = mongoose.model<ISubscription>('subscription', subscriptionSchema);
export default Subscription;
