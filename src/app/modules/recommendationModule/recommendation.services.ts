import IRecommendation from "./recommendation.interface";
import Recommendation from "./recommendation.model";

// service for create new recommendation
export const createRecommendation = async (recommendation: IRecommendation) => {
  const newRecommendation = new Recommendation(recommendation);
  return await newRecommendation.save();
};

// service for get single recommendation
export const getSingleRecommendationByCategory = async (id: string) => {
  return await Recommendation.findOne({ category: id }).populate('category', 'title ageGroup').populate('bookCategorySuggestions', 'title');
};

// service for update recommendation
export const updateRecommendation = async (id: string, recommendation: IRecommendation) => {
  return await Recommendation.findByIdAndUpdate(id, recommendation, { new: true });
};

// service for delete recommendation
export const deleteRecommendation = async (id: string) => {
  return await Recommendation.findByIdAndDelete(id);
};

export default {
  createRecommendation,
  getSingleRecommendationByCategory,
  updateRecommendation,
  deleteRecommendation,
};
