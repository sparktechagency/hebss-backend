import Stripe from 'stripe';
import { Request, Response } from 'express';
import config from '../../config';
import asyncHandler from '../../shared/asyncHandler';
import CustomError from '../errors';
import userServices from '../modules/userModule/user.services';
import subscriptionPurchaseServices from '../modules/subscriptionPurchaseModule/subscriptionPurchase.services';
import { Types } from 'mongoose';
import sendMail from '../../utils/sendEmail';

const stripe = new Stripe(config.stripe_secret_key as string);

export const stripeWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = config.stripe_webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    throw new CustomError.BadRequestError(err.message);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = session.customer as string;

  const user = await userServices.getSpecificUserByCustomerId(customerId);
  if (!user) throw new CustomError.NotFoundError('User not found');

  switch (event.type) {
    case 'checkout.session.completed': {
      console.log('Checkout session completed');

      const subscriptionId = session.subscription as string;

      // Retrieve full subscription to get the priceId
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = stripeSubscription.items.data[0]?.price?.id;

      const subscriptionPurchase = await subscriptionPurchaseServices.createSubscriptionPurchase({
        user: user._id as Types.ObjectId,
        subscription: {
          id: subscriptionId,
          priceId: priceId || '',
        },
        paymentType: 'card',
        paymentStatus: 'paid',
        isActive: true,
      });

      user.subscription = {
        isActive: true,
        purchaseId: subscriptionPurchase._id as Types.ObjectId,
      };
      await user.save();

      const content = `Congratulations! Your subscription purchase is successful!`;
      await sendMail({
        from: config.gmail_app_user as string,
        to: user.email,
        subject: 'Illuminate Muslim Minds - Subscription Purchase',
        text: content,
      });
      break;
    }

    case 'invoice.payment_failed': {
      console.warn('Payment failed for invoice', session.id);

      const content = `Your subscription purchase has failed!`;
      await sendMail({
        from: config.gmail_app_user as string,
        to: user.email,
        subject: 'Illuminate Muslim Minds - Subscription Payment Failed',
        text: content,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      user.subscription.isActive = false;
      await user.save();

      const content = `Your subscription has been canceled.`;
      await sendMail({
        from: config.gmail_app_user as string,
        to: user.email,
        subject: 'Illuminate Muslim Minds - Subscription Canceled',
        text: content,
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const newPriceId = subscription.items.data[0]?.price?.id;
      const subscriptionId = subscription.id;

      const existingPurchase = await subscriptionPurchaseServices.getSubscriptionPurchaseByPriceId(newPriceId);

      let purchaseId = existingPurchase?._id;

      if (existingPurchase?.subscription?.priceId !== newPriceId) {
        const newPurchase = await subscriptionPurchaseServices.createSubscriptionPurchase({
          user: user._id as Types.ObjectId,
          subscription: {
            id: subscriptionId,
            priceId: newPriceId,
          },
          paymentType: 'card',
          paymentStatus: 'paid',
          isActive: true,
        });
        purchaseId = newPurchase._id;

        if (existingPurchase) {
          await subscriptionPurchaseServices.updateSubscriptionPurchase(existingPurchase._id as string, {
            isActive: false,
          });
        }

        const content = `Your subscription plan has been updated successfully!`;
        await sendMail({
          from: config.gmail_app_user as string,
          to: user.email,
          subject: 'Illuminate Muslim Minds - Plan Switched',
          text: content,
        });
      }

      user.subscription = {
        isActive: true,
        purchaseId: purchaseId as Types.ObjectId,
      };
      await user.save();
      break;
    }

    case 'customer.subscription.paused': {
      user.subscription.isActive = false;
      await user.save();

      const content = `Your subscription has been paused.`;
      await sendMail({
        from: config.gmail_app_user as string,
        to: user.email,
        subject: 'Illuminate Muslim Minds - Subscription Paused',
        text: content,
      });
      break;
    }

    case 'customer.subscription.resumed': {
      user.subscription.isActive = true;
      await user.save();

      const content = `Your subscription has been resumed.`;
      await sendMail({
        from: config.gmail_app_user as string,
        to: user.email,
        subject: 'Illuminate Muslim Minds - Subscription Resumed',
        text: content,
      });
      break;
    }
  }

  res.status(200).json({ received: true });
});
