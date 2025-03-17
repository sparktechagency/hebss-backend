import { Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  user: Types.ObjectId;
  box: Types.ObjectId;
  soldBooks: Types.ObjectId[];
  extraBooks: Types.ObjectId[];
  isActive: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
