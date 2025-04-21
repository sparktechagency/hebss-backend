import mongoose from "mongoose";
import { IReview } from "./reviewModule.interface";

const reviewSchema = new mongoose.Schema<IReview>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: 'box', required: true },
    readerThought: { type: String, enum: ['dead', 'bored', 'shocked', 'happy', 'loved'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    topicAndTheme: { type: String, enum: ['disliked', 'liked', 'loved'], required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model<IReview>('review', reviewSchema);
export default Review;