import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import CustomError from '../../errors';
import recommendationServices from './recommendation.services';
import { Request, Response } from 'express';
import categoryServices from '../categoryModule/category.services';
import { Types } from 'mongoose';

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
  const { dateOfBirth } = req.params;
  // extract age group from date of birth
  const year = new Date(dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - year;

  
  const category: any = await categoryServices.getCategoryByAge(age);
  if(!category){
    throw new CustomError.NotFoundError('Category not found for the respected date of birth!');
  }

  const recommendation = await recommendationServices.getSingleRecommendationByCategory(category._id);
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
