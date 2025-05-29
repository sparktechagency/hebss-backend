import mongoose from 'mongoose';
import { ISubscribe } from './subscribe.interface';

const subscribeSchema = new mongoose.Schema<ISubscribe>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    subscribe: {
      type: Boolean,
      default: true,
    },
    name: String,
  },
  {
    timestamps: true,
  },
);

const Subscribe = mongoose.model<ISubscribe>('subscribe', subscribeSchema);
export default Subscribe;
