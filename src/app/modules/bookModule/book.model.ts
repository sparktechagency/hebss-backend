import mongoose, { Schema, model } from 'mongoose';
import { IBook } from './book.interface';

const bookSchema = new Schema<IBook>({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'grade' },
  bookCollection: { type: mongoose.Schema.Types.ObjectId, ref: 'bookCollection' },
  name: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  format: {
    type: String,
    enum: ['paper', 'ebook'],
    default: 'paper',
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['instock', 'outofstock'],
    default: 'instock',
  },
  isArabic: {
    type: Boolean,
    default: false,
  },
  bookLanguage: {
    type: String,
    enum: ['english', 'arabic'],
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  coverImage: { type: String, required: true },
  weight: { type: Number, required: true },
});

bookSchema.index({ name: 'text', author: 'text', description: 'text'});

const Book = model<IBook>('book', bookSchema);

export default Book;
