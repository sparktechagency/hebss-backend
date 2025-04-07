import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Survey from './survey.model';
import CustomError from '../../errors';
import { getCategoryByAge, parseCostStatement } from './survey.utils';
import userServices from '../userModule/user.services';
import IUser from '../userModule/user.interface';
import { Types } from 'mongoose';
import { calculateAge } from '../../../utils/calculateAge';

const createSurvey = asyncHandler(async (req: Request, res: Response) => {
  const surveyData = req.body;

  // check surveyData.dateOfBirth is not bigger than 11 years
  const age = calculateAge(surveyData.dateOfBirth);
  if (age > 11) {
    throw new CustomError.BadRequestError('Age should be less than 11 years.');
  }

  const categoryId = await getCategoryByAge(age);

  if (!categoryId) {
    throw new CustomError.BadRequestError('No category found for the given age.');
  }

  surveyData.category = categoryId;

  if (surveyData.costSpend?.statement) {
    const parsedCost = parseCostStatement(surveyData.costSpend.statement);
    surveyData.costSpend.minPrice = parsedCost.minPrice;
    surveyData.costSpend.maxPrice = parsedCost.maxPrice;
    surveyData.costSpend.bookRange = parsedCost.bookRange;
  }

  const user: IUser = await userServices.getSpecificUserByEmail(surveyData.email);

  if (!user) {
    throw new CustomError.BadRequestError('User not found!');
  }

  const newSurvey = await Survey.create(surveyData);

  user.survey = newSurvey._id as Types.ObjectId;
  await user.save();

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Survey created successfully',
    data: newSurvey,
  });
});

export default {
  createSurvey,
};
