import { Document, Types } from 'mongoose';

export interface IReview extends Document {
  user: Types.ObjectId;
  box: Types.ObjectId;
  readerThought: string;
  difficulty: string;
  topicAndTheme: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
