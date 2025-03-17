import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import InvoiceServices from './invoice.services';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../../errors';

class InvoiceController {
  createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceData = req.body;
    const invoice = await InvoiceServices.createInvoice(invoiceData);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Invoice created successfully',
      data: invoice,
    });
  });

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
}

export default new InvoiceController();
