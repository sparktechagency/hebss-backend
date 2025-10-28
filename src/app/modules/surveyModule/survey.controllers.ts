import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Survey from './survey.model';
import CustomError from '../../errors';
import { getCategoryByAge, parseCostStatement } from './survey.utils';
import userServices from '../userModule/user.services';
import IUser from '../userModule/user.interface';
import { ObjectId, Types } from 'mongoose';
import { calculateAge } from '../../../utils/calculateAge';
import surveyServices from './survey.services';

const createSurvey = asyncHandler(async (req: Request, res: Response) => {
  const surveyData = req.body;

  // Validate required fields
  if (!surveyData.dateOfBirth || !surveyData.email) {
    throw new CustomError.BadRequestError('Date of birth and email are required');
  }

  // Age validation
  const age = calculateAge(surveyData.dateOfBirth);
  if (age > 11 || age < 0) {
    throw new CustomError.BadRequestError('Age should be between 0 and 11 years.');
  }

  const categoryId = await getCategoryByAge(age);
  if (!categoryId) {
    throw new CustomError.BadRequestError('No category found for the given age.');
  }

  surveyData.category = categoryId;

  if (surveyData.costSpend?.statement) {
    try {
      const parsedCost = parseCostStatement(surveyData.costSpend.statement);
      surveyData.costSpend = { ...surveyData.costSpend, ...parsedCost };
    } catch (error) {
      throw new CustomError.BadRequestError('Invalid cost statement format');
    }
  }

  const user: IUser = await userServices.getSpecificUserByEmail(surveyData.email);
  // if (!user) {
  //   throw new CustomError.BadRequestError('User not found!');
  // }

  // Use transaction for multiple database operations
  const session = await Survey.startSession();
  session.startTransaction();

  try {
    const newSurvey = await Survey.create([surveyData], { session });
    if(user){
      user.survey = newSurvey[0]._id as Types.ObjectId;
      await user.save({ session });
    }
    await session.commitTransaction();

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Survey created successfully',
      data: newSurvey[0],
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getSurveyById = asyncHandler(async (req: Request, res: Response) => {
  const {id} = req.params;
  const survey = await surveyServices.getSurveyById(id as unknown as ObjectId);
  if(!survey){
    throw new CustomError.BadRequestError("Survey not found!");
  }

  sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Survey retrieve successfully',
      data: survey,
    });
})

export default {
  createSurvey,
  getSurveyById
};
