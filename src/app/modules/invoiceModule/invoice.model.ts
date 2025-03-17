import mongoose from 'mongoose';
import { IInvoice } from './invoice.interface';

const invoiceSchema = new mongoose.Schema<IInvoice>(
  {
    invoiceId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: 'box', required: true },
    soldBooks: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
        quantity: { type: Number, default: 1 },
      },
    ],
    extraBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['kept', 'intiate'], default: 'intiate' },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IInvoice>('invoice', invoiceSchema);
