import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import SubscriptionPurchaseService from './subscriptionPurchase.services';
import { ISubscriptionPurchase } from './subscriptionPurchase.interface';
import { StatusCodes } from 'http-status-codes';

class SubscriptionPurchaseController {
  createSubscriptionPurchase = asyncHandler(async (req: Request, res: Response) => {
    const subscriptionPurchaseData: ISubscriptionPurchase = req.body;

    const existingSubscriptionPurchase = await SubscriptionPurchaseService.getSubscriptionPurchaseByUserId(
      subscriptionPurchaseData.user.toString(),
    );

    let subscriptionPurchase;

    if (existingSubscriptionPurchase) {
      const updatedSubscriptionPurchase = await SubscriptionPurchaseService.updateSubscriptionPurchase(
        existingSubscriptionPurchase._id!.toString(),
        subscriptionPurchaseData,
      );

      if (!updatedSubscriptionPurchase?.isModified) {
        throw new CustomError.BadRequestError('Failed to purchase subscription!');
      }
      // subscriptionPurchase = updatedSubscriptionPurchase;
    } else {
      subscriptionPurchase = await SubscriptionPurchaseService.createSubscriptionPurchase(subscriptionPurchaseData);
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Subscription purchase successfully',
      data: subscriptionPurchase,
    });
  });

  getSubscriptionPurchaseById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscriptionPurchase = await SubscriptionPurchaseService.getSubscriptionPurchaseById(id);
    if (!subscriptionPurchase) {
      throw new CustomError.NotFoundError('Subscription purchase not found!');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription purchase retrieved successfully',
      data: subscriptionPurchase,
    });
  });

  getSubscriptionPurchaseByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscriptionPurchases = await SubscriptionPurchaseService.getSubscriptionPurchaseByUserId(id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription purchases retrieved successfully',
      data: subscriptionPurchases,
    });
  });

  getSubscriptionPurchasesBySubscriptionType = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;
    if (!type) {
      throw new CustomError.BadRequestError('Subscription type is required!');
    }
    const subscriptionPurchases = await SubscriptionPurchaseService.getSubscriptionPurchasesBySubscriptionType(type as string);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription purchases by type retrieved successfully',
      data: subscriptionPurchases,
    });
  });
}

export default new SubscriptionPurchaseController();
