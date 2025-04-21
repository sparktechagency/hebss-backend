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
}

export default new ReviewServices();
