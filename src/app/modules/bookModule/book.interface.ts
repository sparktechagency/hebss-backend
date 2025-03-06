import { Document, Types } from 'mongoose';

export interface IBook extends Document {
  category: Types.ObjectId;
  grade: Types.ObjectId;
  collection: Types.ObjectId;
  name: string;
  author: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  format: string;
  status: string;
  language: string;
  level: string;
}
