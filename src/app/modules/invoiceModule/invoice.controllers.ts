import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import InvoiceServices from './invoice.services';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../../errors';
import IdGenerator from '../../../utils/IdGenerator';
import OrderServices from '../orderModule/order.services';
import bookServices from '../bookModule/book.services';
import Stripe from 'stripe';
import config from '../../../config';
import userServices from '../userModule/user.services';

const stripe = new Stripe(config.stripe_secret_key as string);

class InvoiceController {
  // createInvoice = asyncHandler(async (req: Request, res: Response) => {
  //   const invoiceData = req.body;

  //   // find last id for use creating new order id
  //   const lastInvoice = await InvoiceServices.getLastInvoice();
  //   const lastInvoiceId = lastInvoice ? parseInt(lastInvoice.invoiceId.split('-')[1]) : 0;

  //   invoiceData.invoiceId = IdGenerator.generateSerialId('INV', lastInvoiceId, 5);
  //   const invoice = await InvoiceServices.createInvoice(invoiceData);

  //   sendResponse(res, {
  //     statusCode: StatusCodes.CREATED,
  //     status: 'success',
  //     message: 'Invoice created successfully',
  //     data: invoice,
  //   });
  // });

  getAllInactiveInvoicesByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoices = await InvoiceServices.getAllInactiveInvoicesByUserId(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Invoices retrieved successfully',
      data: invoices,
    });
  });

  getActiveInvoiceByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await InvoiceServices.getActiveInvoiceByUserId(id);

    if (!invoice) {
      throw new CustomError.NotFoundError('Invoice not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Invoice retrieved successfully',
      data: invoice,
    });
  });

  updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoiceData = req.body;

    const existingInvoice = await InvoiceServices.getInvoiceById(id);

    if (!existingInvoice) {
      throw new CustomError.NotFoundError('Invoice not found!');
    }

    const invoice = await InvoiceServices.updateInvoice(id, invoiceData);

    if (!invoice?.isModified) {
      throw new CustomError.BadRequestError('Failed to update invoice!');
    }

    if (invoiceData.soldBooks.length > 0) {
      existingInvoice.status = 'kept';
      await existingInvoice.save();
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Invoice updated successfully',
    });
  });

  getPaidForSpecificInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const invoiceData = req.body;

    // 1. Fetch invoice
    const invoice = await InvoiceServices.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new CustomError.NotFoundError('Invoice not found!');
    }

    // 2. Fetch associated user
    const user = await userServices.getSpecificUser(invoice.user.toString());
    if (!user) {
      throw new CustomError.NotFoundError('User not found!');
    }

    // 3. Business rule validations
    if (invoice.paymentStatus === 'paid') {
      throw new CustomError.BadRequestError('Invoice already paid!');
    }

    if (!invoice.isActive) {
      throw new CustomError.BadRequestError('Invoice is not active!');
    }

    if (invoice.status !== 'intiate') {
      throw new CustomError.BadRequestError('Invoice status is not initiate!');
    }

    if (!invoiceData.returnTrackingCode || !invoiceData.returnLabelUrl) {
      throw new CustomError.BadRequestError('Proceed with shipment before getting paid!');
    }

    if (invoiceData.soldBooks.length === 0) {
      throw new CustomError.BadRequestError('Invoice has no sold books!');
    }

    if (!user.stripeCustomerId || !user.stripePaymentMethodId) {
      throw new CustomError.BadRequestError('User does not have a saved payment method.');
    }

    // 4. Calculate total amount
    let amount = 0;

    invoice.soldBooks.forEach((book: any) => {
      amount += book.quantity * book.bookId.price.amount;
    });

    if (Array.isArray(invoiceData.extraBooks) && invoiceData.extraBooks.length > 0) {
      await Promise.all(
        invoiceData.extraBooks.map(async (book: any) => {
          const extraBook = await bookServices.getBookById(book.bookId);
          if (!extraBook) {
            throw new CustomError.NotFoundError('Extra book not found!');
          }
          amount += book.quantity * extraBook.price.amount;
        }),
      );
    }

    // Convert to cents for Stripe
    const totalAmount = Math.round(amount * 100);

    // 5. Create Stripe payment intent using saved card
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        customer: user.stripeCustomerId,
        payment_method: user.stripePaymentMethodId,
        off_session: true,
        confirm: true,
      });
    } catch (error: any) {
      console.error('Stripe Payment Error:', error);

      if (error.code === 'authentication_required') {
        throw new CustomError.BadRequestError('Card requires authentication. Ask user to verify payment.');
      }

      throw new CustomError.BadRequestError(`Payment failed: ${error.message}`);
    }

    // 6. Update invoice if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      invoice.paymentStatus = 'paid';
      invoice.status = 'kept';
      invoice.paymentType = 'card';
      invoice.totalAmount = amount;
      invoice.returnLabelUrl = invoiceData.returnLabelUrl;
      invoice.returnTrackingCode = invoiceData.returnTrackingCode;
      invoice.trackingUrl = invoiceData.trackingUrl || null;

      await invoice.save();
    } else {
      throw new CustomError.BadRequestError('Payment failed. Try again!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Invoice payment completed successfully',
      data: invoice,
    });
  });
}

export default new InvoiceController();
