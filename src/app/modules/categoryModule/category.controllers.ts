import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CategoryServices from './category.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import BoxServices from '../boxModule/box-services';
import { ObjectId } from 'mongoose';
class CategoryController {
  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryData = req.body;
    const newCategory = await CategoryServices.createCategory(categoryData);

    if (!newCategory) {
      throw new CustomError.BadRequestError('Failed to create category!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Category created successfully',
      data: newCategory,
    });
  });

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryServices.getCategories();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories,
    });
  });

  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await CategoryServices.getCategoryById(id);

    if (!category) {
      throw new CustomError.NotFoundError('Category not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const categoryData = req.body;

    if (categoryData.title) {
      const box: any = await BoxServices.getBoxesByCategoryId(id as unknown as ObjectId);
      if (box) {
        box.title = categoryData.title;
        await box.save();
      }
    }

    const updatedCategory = await CategoryServices.updateCategory(id, categoryData);

    if (!updatedCategory) {
      throw new CustomError.BadRequestError('Failed to update category!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Category updated successfully',
    });
  });

  deleteAllCategory = asyncHandler(async (req: Request, res: Response) => {
    const deletedCategory = await CategoryServices.deleteAllCategory();

    if (!deletedCategory?.deletedCount) {
      throw new CustomError.BadRequestError('Failed to delete categories!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'All categories deleted successfully',
    });
  });
}

export default new CategoryController();
