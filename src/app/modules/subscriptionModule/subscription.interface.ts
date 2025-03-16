import { Document } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  price: {
    amount: number;
    currency: string;
  };
  type: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}
