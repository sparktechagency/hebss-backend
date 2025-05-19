import mongoose from 'mongoose';
import { IInvoice } from './invoice.interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

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
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paymentType: { type: String, enum: ['cash', 'card'] },
    totalAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    currency: { type: String, enum: [CURRENCY_ENUM.USD], default: CURRENCY_ENUM.USD },
    returnLabelUrl: { type: String },
    returnTrackingCode: { type: String },
    trackingUrl: { type: String },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IInvoice>('invoice', invoiceSchema);
