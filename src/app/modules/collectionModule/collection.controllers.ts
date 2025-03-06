import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import CollectionServices from './collection.services';

class CollectionController {
  createCollection = asyncHandler(async (req: Request, res: Response) => {
    const collectionData = req.body;
    const newCollection = await CollectionServices.createCollection(collectionData);

    if (!newCollection) {
      throw new CustomError.BadRequestError('Failed to create collection!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Collection created successfully',
      data: newCollection,
    });
  });

  getCollections = asyncHandler(async (req: Request, res: Response) => {
    const collections = await CollectionServices.getCollections();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Collections retrieved successfully',
      data: collections,
    });
  });

  getCollectionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const collection = await CollectionServices.getCollectionById(id);

    if (!collection) {
      throw new CustomError.NotFoundError('Collection not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Collection retrieved successfully',
      data: collection,
    });
  });

  updateCollection = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const collectionData = req.body;
    const updatedCollection = await CollectionServices.updateCollection(id, collectionData);

    if (!updatedCollection) {
      throw new CustomError.BadRequestError('Failed to update collection!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Collection updated successfully',
    });
  });

  deleteAllCollections = asyncHandler(async (req: Request, res: Response) => {
    const deletedCollections = await CollectionServices.deleteAllCollections();

    if (!deletedCollections?.deletedCount) {
      throw new CustomError.BadRequestError('Failed to delete collections!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'All collections deleted successfully',
    });
  });
}

export default new CollectionController();
