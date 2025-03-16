import { Document, Types } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  user: {
    userId: Types.ObjectId;
    name: string;
    email: string;
  };
  items: [
    {
      itemId: Types.ObjectId;
      name: string;
      price: number;
      currency: string;
      quantity: number;
    },
  ];
  price: {
    amount: number;
    currency: string;
  };
  discount: {
    type: string;
    amount: number;
    currency: string;
  };
  total: {
    amount: number;
    currency: string;
  };
  shippingAddress: {
    state: string;
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  status: string;
  paymentInfo: {
    type: string;
    status: string;
    tnxId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
