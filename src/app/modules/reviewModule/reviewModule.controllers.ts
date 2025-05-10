import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import reviewModuleServices from './reviewModule.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

class ReviewController {
  createReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewData = req.body;
    const review = await reviewModuleServices.createReview(reviewData);
    if (!review) {
      throw new CustomError.BadRequestError('Failed to create review!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Review created successfully',
      data: review,
    });
  });

  getReviewsByBoxId = asyncHandler(async (req: Request, res: Response) => {
    const { boxId } = req.params;
    const reviews = await reviewModuleServices.getReviewsByBoxId(boxId);
    if (!reviews) {
      throw new CustomError.NotFoundError('Reviews not found!');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Reviews retrieved successfully',
      data: reviews,
    });
  });

  getReviewsByProviderId = asyncHandler(async (req: Request, res: Response) => {
    const { providerId } = req.params;
    const reviews = await reviewModuleServices.getReviewsByProviderId(providerId);
    if (!reviews) {
      throw new CustomError.NotFoundError('Reviews not found!');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Reviews retrieved successfully',
      data: reviews,
    });
  });

  getReviewById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const review = await reviewModuleServices.getReviewById(id);
    if (!review) {
      throw new CustomError.NotFoundError('Review not found!');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Review retrieved successfully',
      data: review,
    });
  });

  deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const review = await reviewModuleServices.deleteReview(id);
    if (!review.deletedCount) {
      throw new CustomError.NotFoundError('Review not found!');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Review deleted successfully',
    });
  });

  getAllReviews = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;
    const reviews = await reviewModuleServices.getAllReviews(search as string, skip, limit);
    const totalReviews = await reviewModuleServices.countReviews();
    const totalPages = Math.ceil(totalReviews / limit);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Reviews retrieved successfully',
      meta: {
        totalData: totalReviews,
        totalPage: totalPages,
        currentPage: page,
        limit: limit,
      },
      data: reviews,
    });
  });
}

export default new ReviewController();
