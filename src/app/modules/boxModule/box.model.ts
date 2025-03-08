import mongoose from 'mongoose';
import { IBox } from './box-interface';

const boxSchema = new mongoose.Schema<IBox>({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  title: { type: String, required: true },
  image: { type: String, required: true },
  piece: { type: Number, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
});

const Box = mongoose.model<IBox>('box', boxSchema);

export default Box;
