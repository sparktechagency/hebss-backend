import mongoose, { model } from 'mongoose';
import IRecommendation from './recommendation.interface';

const recommandationSchema = new mongoose.Schema<IRecommendation>(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    description: { type: String, required: true },
    skillSuggestions: { type: [String], required: true },
    bookCategorySuggestions: { type: [mongoose.Schema.Types.ObjectId], ref: 'bookCollection' },
  },
  {
    timestamps: true,
  },
);

const Recommendation = model<IRecommendation>('recommendation', recommandationSchema);
export default Recommendation;
