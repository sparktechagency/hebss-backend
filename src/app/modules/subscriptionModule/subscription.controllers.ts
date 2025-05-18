import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import SubscriptionServices from './subscription.services';
import config from '../../../config';
import { CURRENCY_ENUM } from '../../../enums/currency';

class SubscriptionController {
  createSubscription = asyncHandler(async (req: Request, res: Response) => {
    const subscriptionData = req.body;

    switch (subscriptionData.type) {
      case 'monthly':
        subscriptionData.priceId = config.basic_price_id;
        break;
      case 'biannually':
        subscriptionData.priceId = config.standard_price_id;
        break;
      case 'quarterly':
        subscriptionData.priceId = config.premium_price_id;
        break;
    }

    const newSubscription = await SubscriptionServices.createSubscription(subscriptionData);

    if (!newSubscription) {
      throw new CustomError.BadRequestError('Failed to create subscription!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Subscription created successfully',
      data: newSubscription,
    });
  });

  getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
    const subscriptions = await SubscriptionServices.getSubscriptions();

    const updatedSubscriptions = subscriptions.map((subscription: any) => {
      let amount: number;
      let currency: string;

      if (subscription.type === 'monthly') {
        amount = 14.99;
        currency = CURRENCY_ENUM.USD;
      } else if (subscription.type === 'biannually') {
        amount = 16.99;
        currency = CURRENCY_ENUM.USD;
      } else if (subscription.type === 'quarterly') {
        amount = 18.99;
        currency = CURRENCY_ENUM.USD;
      } else {
        amount = 0;
        currency = CURRENCY_ENUM.USD;
      }

      return {
        ...subscription.toObject(),
        price: { amount, currency },
      };
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscriptions retrieved successfully',
      data: updatedSubscriptions,
    });
  });

  getSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscription = await SubscriptionServices.getSubscriptionById(id);

    if (!subscription) {
      throw new CustomError.NotFoundError('Subscription not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription retrieved successfully',
      data: subscription,
    });
  });

  updateSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscriptionData = req.body;

    if (subscriptionData.name) {
      const subscription: any = await SubscriptionServices.getSubscriptionById(id);
      if (subscription) {
        subscription.name = subscriptionData.name;
        await subscription.save();
      }
    }

    const updatedSubscription = await SubscriptionServices.updateSubscription(id, subscriptionData);

    if (!updatedSubscription) {
      throw new CustomError.BadRequestError('Failed to update subscription!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription updated successfully',
    });
  });

  deleteSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedSubscription = await SubscriptionServices.deleteSubscription(id);

    if (!deletedSubscription?.$isDeleted) {
      throw new CustomError.BadRequestError('Failed to delete subscription!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'All subscriptions deleted successfully',
    });
  });
}

export default new SubscriptionController();
