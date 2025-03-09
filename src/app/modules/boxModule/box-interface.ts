import { Document, Types } from 'mongoose';

export interface IBox extends Document {
  category: Types.ObjectId;
  title: string;
  image: string;
  piece: number;
  books: Types.ObjectId[];
  price: {
    amount: number;
    currency: string;
  };
  _id: Types.ObjectId
}
