import mongoose from 'mongoose';
import { ISubscription } from './subscription.interface';

const subscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    name: { type: String, required: true },
    priceId: { type: String },
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
