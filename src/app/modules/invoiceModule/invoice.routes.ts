import { Router } from 'express';
import InvoiceController from './invoice.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const invoiceRouter = Router();

invoiceRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

// invoiceRouter.post('/create', InvoiceController.createInvoice);
invoiceRouter.get('/retrieve/history/user/:id', InvoiceController.getAllInactiveInvoicesByUserId);
invoiceRouter.get('/current/retrieve/user/:id', InvoiceController.getActiveInvoiceByUserId);
invoiceRouter.patch('/update/:id', InvoiceController.updateInvoice);
invoiceRouter.post('/paid/:invoiceId', InvoiceController.getPaidForSpecificInvoice);

export default invoiceRouter;
