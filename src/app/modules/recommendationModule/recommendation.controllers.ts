import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import CustomError from '../../errors';
import recommendationServices from './recommendation.services';
import { Request, Response } from 'express';

// controller for create new recommendation
const createRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const newRecommendation = await recommendationServices.createRecommendation(req.body);
  if (!newRecommendation) {
    throw new CustomError.BadRequestError('Failed to create new recommendation!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Recommendation created successfully',
    data: newRecommendation,
  });
});

// controller for get recommandation by category
const getRecommendationByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const recommendation = await recommendationServices.getSingleRecommendationByCategory(categoryId);
  if (!recommendation) {
    throw new CustomError.NotFoundError('Recommendation not found!');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Recommendation retrieved successfully',
    data: recommendation,
  });
});

// controller for update specific recommendation
const updateRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedRecommendation = await recommendationServices.updateRecommendation(id, req.body);
  if (!updatedRecommendation?.isModified) {
    throw new CustomError.NotFoundError('Recommendation not found!');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Recommendation updated successfully',
  });
});

// controller for delete specific recommendation
const deleteRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedRecommendation = await recommendationServices.deleteRecommendation(id);
  if (!deletedRecommendation?.$isDeleted) {
    throw new CustomError.NotFoundError('Failed to delete recommendation!');
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Recommendation deleted successfully',
  });
});

export default {
  createRecommendation,
  getRecommendationByCategory,
  updateRecommendation,
  deleteRecommendation,
};
