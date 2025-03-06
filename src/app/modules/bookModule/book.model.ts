import mongoose, { Schema, model } from 'mongoose';
import { IBook } from './book.interface';

const bookSchema = new Schema<IBook>({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'grade' },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'collection' },
  name: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  format: { type: String, required: true },
  status: { type: String, required: true },
  language: { type: String, required: true },
  level: { type: String, required: true },
});

const Book = model<IBook>('Book', bookSchema);

export default Book;
