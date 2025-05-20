import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import OrderServices from './order.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CURRENCY_ENUM } from '../../../enums/currency';
import Book from '../bookModule/book.model';
import IdGenerator from '../../../utils/IdGenerator';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import config from '../../../config';
import billingServices from '../billingModule/billing.services';
import EasyPost from '@easypost/api';

const stripe = new Stripe(config.stripe_secret_key as string);
const api = new EasyPost(config.easypost_test_api_key as string);

class OrderController {
  getShippingRates = asyncHandler(async (req: Request, res: Response) => {
    const { toAddress, parcelDetails } = req.body;

    const fromAddress = {
      company: 'Illuminate Muslim Minds',
      street1: '789 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      country: 'US',
    };

    const shipment = await api.Shipment.create({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcelDetails,
      options: {
        carrier_accounts: [config.usps_return_carrier_id],
        is_return: true,
      },
    });

    // Fallback if no rates found
    if (!shipment.rates || shipment.rates.length === 0) {
      throw new CustomError.BadRequestError('No rates found for the return shipment');
    }

    const returnRate = shipment.lowestRate(['USPS']);
    const boughtShipment = await api.Shipment.buy(shipment.id, returnRate);

    const returnLabelUrl = boughtShipment.postage_label?.label_url;
    const returnTrackingCode = boughtShipment.tracking_code;
    const tracker = await api.Tracker.retrieve(boughtShipment.tracker.id);
    const trackingUrl = tracker.public_url;

    const rates = boughtShipment.rates
      .filter((rate) => rate.carrier === 'USPS')
      .map((rate) => ({
        id: rate.id,
        carrier: rate.carrier,
        service: rate.service,
        rate: rate.rate,
        deliveryDays: rate.delivery_days,
        currency: rate.currency,
      }));

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Return shipping label purchased and rates retrieved',
      data: {
        rates,
        returnLabelUrl,
        returnTrackingCode,
        trackingUrl,
      },
    });
  });

  initiateOrderPayment = asyncHandler(async (req: Request, res: Response) => {
    const { items, shippingCost, customerEmail } = req.body;

    if (!items || items.length === 0) {
      throw new CustomError.BadRequestError('No items in the order.');
    }

    const bookIds = items.map((item: any) => item.itemId);
    const books = await Book.find({ _id: { $in: bookIds } });

    const lineItems = items.map((item: any) => {
      const book = books.find((b: any) => b._id.toString() === item.itemId.toString());
      if (!book) throw new CustomError.NotFoundError(`Book ${item.itemId} not found`);
      const basePrice = book.price.amount;
      let finalPrice = basePrice;

      if (book.isDiscount && book.discountPrice) {
        if (book.discountPrice.type === 'percentage') {
          finalPrice = basePrice - (book.discountPrice.amount / 100) * basePrice;
        } else {
          finalPrice = basePrice - book.discountPrice.amount;
        }
      }

      return {
        price_data: {
          currency: CURRENCY_ENUM.USD,
          product_data: {
            name: book.name,
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add shipping cost as an additional line item
    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: CURRENCY_ENUM.USD,
          product_data: {
            name: 'Shipping Cost',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${config.frontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/cancel`,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Order created successfully',
      data: { url: session.url },
    });
  });

  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const orderData = req.body;

    // 1. Retrieve Stripe session
    const session: any = await stripe.checkout.sessions.retrieve(orderData.sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    if (!session || session.payment_status !== 'paid') {
      throw new CustomError.BadRequestError('Payment not completed or session not found.');
    }

    //check the duplicate order for the session
    const order = await OrderServices.getOrderBySessionId(orderData.sessionId);

    if (order) {
      throw new CustomError.BadRequestError('Order already exists!');
    }

    const lineItems = session.line_items?.data || [];

    // 2. Generate orderId
    const lastOrder = await OrderServices.getLastOrder();
    const lastOrderId = lastOrder ? parseInt(lastOrder.orderId.split('-')[1]) : 0;
    const orderId = IdGenerator.generateSerialId('ORD', lastOrderId, 5);

    const totalAmount = session.amount_total! / 100;

    // 4. Create Order
    const newOrder = await OrderServices.createOrder({
      orderId,
      user: orderData.user,
      items: orderData.items,
      // shippingAddress: orderData.shippingAddress,
      price: {
        amount: totalAmount,
        currency: session.currency!,
      },
      total: {
        amount: totalAmount,
        currency: session.currency!,
      },
      paymentInfo: {
        type: 'card',
        status: 'paid',
        tnxId: session.payment_intent?.id as string,
      },
      sessionId: orderData.sessionId,
      returnLabelUrl: orderData.returnLabelUrl,
      returnTrackingCode: orderData.returnTrackingCode,
      trackingUrl: orderData.trackingUrl,
    });

    // decrease quantity after creating order
    Promise.all(
      orderData.items.map(async (item: any) => {
        await Book.findByIdAndUpdate(item.itemId, { $inc: { quantity: -item.quantity } });
      }),
    );

    // create billing
    await billingServices.createBilling({
      user: orderData.user.userId,
      type: 'order',
      contentId: newOrder._id,
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Order placed successfully!',
      data: newOrder,
    });
  });

  // createOrder = asyncHandler(async (req: Request, res: Response) => {
  //   const orderData = req.body;

  //   // find last id for use creating new order id
  //   const lastOrder = await OrderServices.getLastOrder();
  //   const lastOrderId = lastOrder ? parseInt(lastOrder.orderId.split('-')[1]) : 0;

  //   orderData.orderId = IdGenerator.generateSerialId('ORD', lastOrderId, 5);

  //   let price = {
  //     amount: 0,
  //     currency: CURRENCY_ENUM.USD,
  //   };

  //   let discount = {
  //     type: 'percentage', // Default
  //     amount: 0,
  //     currency: CURRENCY_ENUM.USD,
  //   };

  //   let total = {
  //     amount: 0,
  //     currency: CURRENCY_ENUM.USD,
  //   };

  //   if (!orderData?.items || orderData.items.length === 0) {
  //     throw new CustomError.BadRequestError('No items in the order.');
  //   }

  //   // Fetch books to ensure correct pricing
  //   const bookIds = orderData.items.map((item: any) => new mongoose.Types.ObjectId(item.itemId));
  //   // console.log(bookIds);
  //   const books = await Book.find({ _id: { $in: bookIds } });

  //   console.log(books.length, orderData.items.length);

  //   if (books.length !== orderData.items.length) {
  //     throw new CustomError.BadRequestError('Some books were not found.');
  //   }

  //   orderData.items.forEach((item: any) => {
  //     const book = books.find((b: any) => b._id.toString() === item.itemId.toString());

  //     if (!book) {
  //       throw new CustomError.BadRequestError(`Book with ID ${item.itemId} not found.`);
  //     }

  //     const itemPrice = book.price.amount * item.quantity;
  //     price.amount += itemPrice;

  //     // Calculate Discount if applicable
  //     if (book.isDiscount && book.discountPrice) {
  //       if (book.discountPrice.type === 'percentage') {
  //         discount.amount += (book.discountPrice.amount / 100) * itemPrice;
  //       } else {
  //         discount.amount += book.discountPrice.amount * item.quantity;
  //       }
  //     }
  //   });

  //   // Ensure discount is not more than price
  //   discount.amount = Math.min(discount.amount, price.amount);

  //   // Calculate final total (Price - Discount)
  //   total.amount = price.amount - discount.amount;
  //   total.amount = Math.max(total.amount, 0); // Ensure total is never negative

  //   // Attach calculated values to order data
  //   orderData.price = price;
  //   orderData.discount = discount;
  //   orderData.total = total;

  //   const newOrder = await OrderServices.createOrder(orderData);

  //   if (!newOrder) {
  //     throw new CustomError.BadRequestError('Failed to create order!');
  //   }

  //   sendResponse(res, {
  //     statusCode: StatusCodes.CREATED,
  //     status: 'success',
  //     message: 'Order created successfully',
  //     data: newOrder,
  //   });
  // });

  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;
    const orders = await OrderServices.getOrders(search as string, skip, limit);
    const totalOrders = await OrderServices.countOrders();
    const totalPages = Math.ceil(totalOrders / limit);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Orders fetched successfully',
      meta: {
        totalData: totalOrders,
        totalPage: totalPages,
        currentPage: page,
        limit: limit,
      },
      data: orders,
    });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await OrderServices.getOrderById(id);

    if (!order) {
      throw new CustomError.NotFoundError('Order not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Order fetched successfully',
      data: order,
    });
  });

  // only status will allow to update
  updateOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderServices.updateOrder(id, status as string);

    if (!order) {
      throw new CustomError.NotFoundError('Order not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Order updated successfully',
    });
  });

  deleteOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await OrderServices.deleteOrder(id);

    if (!order) {
      throw new CustomError.NotFoundError('Order not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Order deleted successfully',
    });
  });
}

export default new OrderController();
