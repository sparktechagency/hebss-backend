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

class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const orderData = req.body;

    // find last id for use creating new order id
    const lastOrder = await OrderServices.getLastOrder();
    const lastOrderId = lastOrder ? parseInt(lastOrder.orderId.split('-')[1]) : 0;

    orderData.orderId = IdGenerator.generateSerialId('ORD', lastOrderId, 5);

    let price = {
      amount: 0,
      currency: CURRENCY_ENUM.USD,
    };

    let discount = {
      type: 'percentage', // Default
      amount: 0,
      currency: CURRENCY_ENUM.USD,
    };

    let total = {
      amount: 0,
      currency: CURRENCY_ENUM.USD,
    };

    if (!orderData?.items || orderData.items.length === 0) {
      throw new CustomError.BadRequestError('No items in the order.');
    }

    // Fetch books to ensure correct pricing
    const bookIds = orderData.items.map((item: any) => new mongoose.Types.ObjectId(item.itemId));
    console.log(bookIds);
    const books = await Book.find({ _id: { $in: bookIds } });

    console.log(books.length, orderData.items.length);

    if (books.length !== orderData.items.length) {
      throw new CustomError.BadRequestError('Some books were not found.');
    }

    orderData.items.forEach((item: any) => {
      const book = books.find((b: any) => b._id.toString() === item.itemId.toString());

      if (!book) {
        throw new CustomError.BadRequestError(`Book with ID ${item.itemId} not found.`);
      }

      const itemPrice = book.price.amount * item.quantity;
      price.amount += itemPrice;

      // Calculate Discount if applicable
      if (book.isDiscount && book.discountPrice) {
        if (book.discountPrice.type === 'percentage') {
          discount.amount += (book.discountPrice.amount / 100) * itemPrice;
        } else {
          discount.amount += book.discountPrice.amount * item.quantity;
        }
      }
    });

    // Ensure discount is not more than price
    discount.amount = Math.min(discount.amount, price.amount);

    // Calculate final total (Price - Discount)
    total.amount = price.amount - discount.amount;
    total.amount = Math.max(total.amount, 0); // Ensure total is never negative

    // Attach calculated values to order data
    orderData.price = price;
    orderData.discount = discount;
    orderData.total = total;

    const newOrder = await OrderServices.createOrder(orderData);

    if (!newOrder) {
      throw new CustomError.BadRequestError('Failed to create order!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Order created successfully',
      data: newOrder,
    });
  });
  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderServices.getOrders();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Orders fetched successfully',
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
