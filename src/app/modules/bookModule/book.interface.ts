import { Document, Types } from 'mongoose';

export interface IBook extends Document {
  category: Types.ObjectId;
  grade: Types.ObjectId;
  bookCollection: Types.ObjectId;
  name: string;
  author: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  isDiscount: boolean;
  discountPrice: {
    type: string;
    amount: number;
    currency: string;
  };
  format: string;
  status: string;
  bookLanguage: string;
  level: string;
  coverImage: string;
  quantity: number;
  isArabic: boolean;
  weight: number;
  summary: string;
}
