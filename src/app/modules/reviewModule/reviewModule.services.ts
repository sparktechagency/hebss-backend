import { IReview } from './reviewModule.interface';
import Review from './reviewModule.model';

class ReviewServices {
  async createReview(reviewData: IReview) {
    const review = new Review(reviewData);
    return await review.save();
  }

  async getReviewsByBoxId(boxId: string) {
    return await Review.find({ box: boxId });
  }

  async getReviewsByProviderId(providerId: string) {
    return await Review.find({ user: providerId });
  }

  async getReviewById(id: string) {
    return await Review.findById(id);
  }

  async deleteReview(id: string) {
    return await Review.deleteOne({ _id: id });
  }

  async getAllReviews(search: string, skip: number, limit: number) {
    const query: any = {};
    if (search) {
      query.$or = [
        { difficulty: { $regex: search, $options: 'i' } },
        { topicAndTheme: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }
    return await Review.find(query).skip(skip).limit(limit);
  }

  async countReviews() {
    return await Review.countDocuments();
  }
}

export default new ReviewServices();
