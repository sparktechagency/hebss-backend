import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import SubscriptionServices from './subscription.services';

class SubscriptionController {
  createSubscription = asyncHandler(async (req: Request, res: Response) => {
    const subscriptionData = req.body;
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
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
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
