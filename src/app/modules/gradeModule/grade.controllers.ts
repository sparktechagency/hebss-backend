import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import GradeServices from './grade.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

class GradeController {
  createGrade = asyncHandler(async (req: Request, res: Response) => {
    const gradeData = req.body;
    const newGrade = await GradeServices.createGrade(gradeData);

    if (!newGrade) {
      throw new CustomError.BadRequestError('Failed to create grade!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Grade created successfully',
      data: newGrade,
    });
  });

  getGrades = asyncHandler(async (req: Request, res: Response) => {
    const grades = await GradeServices.getGrades();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Grades retrieved successfully',
      data: grades,
    });
  });

  getGradeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const grade = await GradeServices.getGradeById(id);

    if (!grade) {
      throw new CustomError.NotFoundError('Grade not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Grade retrieved successfully',
      data: grade,
    });
  });

  updateGrade = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const gradeData = req.body;
    const updatedGrade = await GradeServices.updateGrade(id, gradeData);

    if (!updatedGrade) {
      throw new CustomError.BadRequestError('Failed to update grade!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Grade updated successfully',
    });
  });

  deleteAllGrades = asyncHandler(async (req: Request, res: Response) => {
    const deletedGrades = await GradeServices.deleteAllGrades();

    if (!deletedGrades?.deletedCount) {
      throw new CustomError.BadRequestError('Failed to delete grades!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'All grades deleted successfully',
    });
  });
}

export default new GradeController();
