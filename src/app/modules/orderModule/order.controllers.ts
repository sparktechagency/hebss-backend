import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import OrderServices from './order.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { CURRENCY_ENUM } from '../../../enums/currency';
import Book from '../bookModule/book.model';
import IdGenerator from '../../../utils/IdGenerator';
import Stripe from 'stripe';
import config from '../../../config';
import billingServices from '../billingModule/billing.services';
import EasyPost from '@easypost/api';

const stripe = new Stripe(config.stripe_secret_key as string);
const api = new EasyPost(config.easypost_test_api_key as string);

class OrderController {


  getShippingRates = asyncHandler(async (req: Request, res: Response) => {
    const { toAddress, parcelDetails, forceAccept } = req.body;

    if (!toAddress || !parcelDetails) {
      throw new CustomError.BadRequestError('toAddress and parcelDetails are required');
    }

    /** Helper to remove EasyPost internal fields */
    const cleanAddress = (addr: any) => {
      if (!addr) return null;
      const cleaned = { ...addr };
      delete cleaned.verifications;
      delete cleaned._params;
      delete cleaned.object;
      delete cleaned.mode;
      delete cleaned.created_at;
      delete cleaned.updated_at;
      delete cleaned.id;
      return cleaned;
    };

    /** STEP 1: TRY VERIFYING DESTINATION ADDRESS */
    let verified: any = null;

    try {
      verified = await api.Address.create({
        ...toAddress,
        verify: ['delivery'],
      });
    } catch (err) {
      verified = null; // Verification failed
    }

    const isValid =
      verified?.verifications?.delivery?.success === true;

    /** STEP 2: If verification FAILS and forceAccept is FALSE → return error + suggestion */
    if (!isValid && !forceAccept) {
      const suggested = cleanAddress(verified) || toAddress;

      return sendResponse(res, {
        statusCode: 422,
        status: 'address_verification_failed',
        message: 'We could not verify this address. Please review or confirm.',
        data: {
          originalAddress: toAddress,
          suggestedAddress: suggested,
          errors: verified?.verifications?.delivery?.errors || [],
        },
      });
    }

    /** STEP 3: Use verified address OR original address if forced */
    const finalToAddress = cleanAddress(isValid ? verified : toAddress);

    /** FIXED FROM ADDRESS (USPS-approved) */
    const fromAddress = {
      company: 'Illuminate Muslim Minds',
      street1: '1 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'US',
    };

    /** STEP 4: CREATE SHIPMENT (NO MORE VERIFICATION) */
    const shipment = await api.Shipment.create({
      to_address: finalToAddress,
      from_address: fromAddress,
      parcel: parcelDetails,
      options: {
        carrier_accounts: [config.usps_return_carrier_id],
        is_return: true,
        verify: false, // Prevent re-verification
      },
    });

    if (!shipment.rates?.length) {
      throw new CustomError.BadRequestError('No USPS rates available');
    }

    /** STEP 5: BUY LOWEST USPS RATE */
    const rate = shipment.lowestRate(['USPS']);
    const bought = await api.Shipment.buy(shipment.id, rate);

    const returnLabelUrl = bought.postage_label?.label_url;
    const trackingCode = bought.tracking_code;

    const tracker = await api.Tracker.retrieve(bought.tracker.id);

    const trackingUrl = tracker.public_url;

    const rates = bought.rates
      .filter((r) => r.carrier === 'USPS')
      .map((r) => ({
        id: r.id,
        carrier: r.carrier,
        service: r.service,
        rate: r.rate,
        deliveryDays: r.delivery_days,
        currency: r.currency,
      }));

    /** SUCCESS */
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Shipping rates retrieved & label created',
      data: {
        rates,
        returnLabelUrl,
        trackingCode,
        trackingUrl,
      },
    });
  });





  initiateOrderPayment = asyncHandler(async (req: Request, res: Response) => {
    const { items, shippingCost, customerEmail } = req.body;
    const { purpose } = req.query;

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
    // console.log(purpose)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'BD'], // collect shipping address
      },
      success_url: `${config.frontend_url}/success?session_id={CHECKOUT_SESSION_ID}&purpose=${purpose}`,
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
    console.log("stripe", stripe)
    // 1. Retrieve Stripe session
    const session: any = await stripe.checkout.sessions.retrieve(orderData.sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    console.log("Shipping Address:", session.customer_details);
    console.log("Session:", session);


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
      shippingAddress: {
        state: session.customer_details?.address?.state || 'N/A, Will come letter',
        street: session.customer_details?.address?.line1 || 'N/A',
        city: session.customer_details?.address?.city || 'N/A',
        country: session.customer_details?.address?.country || 'N/A',
        zipCode: session.customer_details?.address?.postal_code || 'N/A',
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
