import { Document } from 'mongoose';

export interface ICollection extends Document {
  title: string;
}
