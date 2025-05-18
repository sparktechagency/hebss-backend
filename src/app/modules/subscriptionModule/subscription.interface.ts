import { Document } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  priceId: string;
  type: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}
