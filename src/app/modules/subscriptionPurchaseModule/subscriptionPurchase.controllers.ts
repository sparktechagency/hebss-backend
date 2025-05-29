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
import { Types } from 'mongoose';
import Stripe from 'stripe';
import subscriptionServices from '../subscriptionModule/subscription.services';

const stripe = new Stripe(config.stripe_secret_key as string);

class SubscriptionPurchaseController {
  // createSubscriptionPurchase = asyncHandler(async (req: Request, res: Response) => {
  //   const subscriptionPurchaseData: ISubscriptionPurchase = req.body;

  //   const user = await userServices.getSpecificUser(subscriptionPurchaseData.user.toString());
  //   if (!user) {
  //     throw new CustomError.NotFoundError('User not found!');
  //   }

  //   const existingSubscriptionPurchase = await SubscriptionPurchaseService.getSubscriptionPurchaseByUserId(
  //     subscriptionPurchaseData.user.toString(),
  //   );

  //   let subscriptionPurchase;

  //   if (existingSubscriptionPurchase) {
  //     const updatedSubscriptionPurchase = await SubscriptionPurchaseService.updateSubscriptionPurchase(
  //       existingSubscriptionPurchase._id!.toString(),
  //       subscriptionPurchaseData,
  //     );

  //     if (!updatedSubscriptionPurchase?.isModified) {
  //       throw new CustomError.BadRequestError('Failed to purchase subscription!');
  //     }
  //     subscriptionPurchase = updatedSubscriptionPurchase;
  //   } else {
  //     subscriptionPurchase = await SubscriptionPurchaseService.createSubscriptionPurchase(subscriptionPurchaseData);
  //   }

  //   if (subscriptionPurchase) {
  //     user.subscription.purchaseId = subscriptionPurchase?._id as Types.ObjectId;
  //     user.subscription.isActive = true;
  //     await user.save();
  //   }

  //   sendResponse(res, {
  //     statusCode: StatusCodes.CREATED,
  //     status: 'success',
  //     message: 'Subscription purchase successfully',
  //     data: subscriptionPurchase,
  //   });
  // });
  createSubscriptionPurchase = asyncHandler(async (req: Request, res: Response) => {
    const { userId, priceId } = req.body;

    if (!userId || !priceId) {
      throw new CustomError.BadRequestError('Missing required fields!');
    }

    const user = await userServices.getSpecificUser(userId);
    if (!user) throw new CustomError.NotFoundError('User not found!');

    // 1. Create Stripe customer if not exists
    if (!user.stripeCustomerId) {
      console.log('insite');
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    console.log(user.stripeCustomerId);

    // 2. Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    const activeSubscription = subscriptions.data[0];

    if (activeSubscription) {
      const currentItem = activeSubscription.items.data[0];
      const currentPriceId = currentItem.price.id;

      if (currentPriceId === priceId) {
        return sendResponse(res, {
          statusCode: StatusCodes.BAD_REQUEST,
          status: 'fail',
          message: 'You already have this subscription active.',
        });
      }

      // 3. Switch plan by updating existing subscription
      await stripe.subscriptions.update(activeSubscription.id, {
        cancel_at_period_end: false,
        proration_behavior: 'create_prorations',
        items: [
          {
            id: currentItem.id,
            price: priceId,
          },
        ],
      });

      return sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Subscription plan updated successfully.',
        data: {
          subscriptionId: activeSubscription.id,
        },
      });
    }

    // 4. No active subscription → Create Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: user.stripeCustomerId,
      success_url: `${config.frontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/cancel`,
    });

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Checkout session created',
      data: {
        checkoutUrl: session.url,
      },
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
    // console.log(subscriptionPurchases)
    let subscriptonInfo: any = await subscriptionServices.getSubscriptionByStripeId(subscriptionPurchases.subscription.priceId as string);
    const price = await stripe.prices.retrieve(subscriptionPurchases.subscription.priceId as string);
    let priceAmount;
    if (price) {
      priceAmount = price.unit_amount! / 100;
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription purchases retrieved successfully',
      data: {
        subscriptionPurchases,
        subscriptonInfo,
        priceAmount,
      },
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

  getAllUsersBySubscriptionId = asyncHandler(async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const users = await SubscriptionPurchaseService.getAllUsersBySubscriptionId(subscriptionId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Users retrieved successfully',
      data: users,
    });
  });

  cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const subscriptionPurchase = await SubscriptionPurchaseService.getSubscriptionPurchaseById(id);
    if (!subscriptionPurchase) {
      throw new CustomError.NotFoundError('Subscription purchase not found!');
    }

    const user = await userServices.getSpecificUser(subscriptionPurchase.user.toString());
    if (!user) {
      throw new CustomError.NotFoundError('User not found!');
    }

    const stripeSubscriptionId = subscriptionPurchase.subscription?.id;
    if (!stripeSubscriptionId) {
      throw new CustomError.BadRequestError('Stripe subscription ID not found!');
    }

    // Cancel at period end on Stripe
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local DB
    subscriptionPurchase.isActive = false;
    await subscriptionPurchase.save();

    user.subscription.isActive = false;
    await user.save();

    // Send cancellation email
    await sendMail({
      from: config.gmail_app_user as string,
      to: user.email,
      subject: 'Subscription Cancellation',
      text: `Your subscription has been successfully scheduled for cancellation at the end of the current billing period.`,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Subscription cancellation scheduled successfully',
    });
  });
}

export default new SubscriptionPurchaseController();
