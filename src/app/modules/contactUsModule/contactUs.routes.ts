import express from 'express';
import contactUsControllers from './contactUs.controllers';
import authorization from '../../middlewares/authorization';

const contactUsRouter = express.Router();

contactUsRouter.post('/create-or-update', contactUsControllers.createOrUpdateContactUs);

contactUsRouter.get('/retrive', contactUsControllers.getContactUs);

contactUsRouter.post('/send-email', contactUsControllers.sendMailToContactUs);

export default contactUsRouter;
