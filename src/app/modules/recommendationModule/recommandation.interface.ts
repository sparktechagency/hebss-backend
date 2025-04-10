import { Document, Types } from 'mongoose';

interface IRecommendation extends Document {
  category: Types.ObjectId;
  title: string;
  
  description: string;
  skillSuggestions: string[];
  bookSuggestions: Types.ObjectId[];
}

export default IRecommendation;
