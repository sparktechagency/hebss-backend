import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import SubscriptionPurchaseService from './subscriptionPurchase.services';
import { ISubscriptionPurchase } from './subscriptionPurchase.interface';
import { StatusCodes } from 'http-status-codes';
import Admin from '../adminModule/admin.model';
import config from '../../../config';
import userServices from '../userModule/user.services';
import sendMail from '../../../utils/sendEmail';

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

    if (!subscriptionPurchases) {
      throw new CustomError.NotFoundError('Subscription purchases not found!');
    }
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

  // controller method for sending subscription disable request to admin email
  sendSubscriptionDisableRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscriptionPurchase = await SubscriptionPurchaseService.getSubscriptionPurchaseById(id);
    if (!subscriptionPurchase) {
      throw new CustomError.NotFoundError('Subscription purchase not found!');
    }

    const user = await userServices.getSpecificUser(subscriptionPurchase.user.toString());
    if (!user) {
      throw new CustomError.NotFoundError('User not found!');
    }

    // send email to admin
    const admins = await Admin.find();
    Promise.allSettled(
      admins.map((admin) => {
        const mailOptions = {
          from: config.gmail_app_user as string,
          to: admin.email,
          subject: 'Subscription Disable Request',
          text: `A subscription disable request has been made for user id: ${user._id} - ${user.email}.`,
        };
        return sendMail(mailOptions);
      }),
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription disable request sent successfully',
    });
  });

  // controller for disable subscription
  disableSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscriptionPurchase = await SubscriptionPurchaseService.getSubscriptionPurchaseById(id);
    if (!subscriptionPurchase) {
      throw new CustomError.NotFoundError('Subscription purchase not found!');
    }

    const user = await userServices.getSpecificUser(subscriptionPurchase.user.toString());
    if (!user) {
      throw new CustomError.NotFoundError('User not found!');
    }

    subscriptionPurchase.isActive = false;
    await subscriptionPurchase.save();

    // send email to user if subscription disable successfull
    const mailOptions = {
      from: config.gmail_app_user as string,
      to: user.email,
      subject: 'Subscription Disable',
      text: `Your subscription has been disabled successfully.`,
    };
    await sendMail(mailOptions);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription disabled successfully',
    });
  });
}

export default new SubscriptionPurchaseController();
