import { Document, Types } from 'mongoose';

export interface ISubscriptionPurchase extends Document {
  user: Types.ObjectId;
  subscription: {
    id: string,
    priceId: string,
  };
  paymentType: string;
  paymentStatus: string;
  isActive: boolean;
  // paymentSource: {
  //   number: string;
  //   tnxId: string;
  //   type: string;
  //   name: string;
  //   isSaved: boolean;
  // };
  createdAt?: Date;
  updatedAt?: Date;
}
