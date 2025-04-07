import { Document, Types } from 'mongoose';

export interface ISurvey extends Document {
  readerName: string;
  email: string;
  relation: string;
  gender: string;
  dateOfBirth: Date;
  category: Types.ObjectId;
  favoriteCollection: Types.ObjectId[];
  interestInArabic: boolean;
  lavelInArabic: string;
  costSpend: {
    statement: string;
    minPrice: number;
    maxPrice: number;
    bookRange: string;
  };
  user: Types.ObjectId;
  cardInfo: {
    number: number;
    expireDate: Date;
    cvv: number;
  };
}
