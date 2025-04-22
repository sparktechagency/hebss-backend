import mongoose from 'mongoose';
import { IBox } from './box-interface';
import { CURRENCY_ENUM } from '../../../enums/currency';

const boxSchema = new mongoose.Schema<IBox>({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  title: { type: String, required: true },
  image: { type: String, required: true },
  piece: { type: Number, default: 0 },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
  type: { type: String, enum: ['regular', 'gift'], default: 'regular' },
  price: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: CURRENCY_ENUM.USD },
  },
});

const Box = mongoose.model<IBox>('box', boxSchema);

export default Box;
