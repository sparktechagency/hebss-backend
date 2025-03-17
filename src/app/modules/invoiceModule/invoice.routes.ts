import { Router } from 'express';
import InvoiceController from './invoice.controllers';

const invoiceRouter = Router();

invoiceRouter.post('/create', InvoiceController.createInvoice);
invoiceRouter.get('/retrieve/history/user/:id', InvoiceController.getAllInactiveInvoicesByUserId);
invoiceRouter.get('/current/retrieve/user/:id', InvoiceController.getActiveInvoiceByUserId);
invoiceRouter.patch('/update/:id', InvoiceController.updateInvoice);

export default invoiceRouter;
