import express from 'express'
import billingController from './billing.controllers';

const billingRouter = express.Router();

billingRouter.get('/retrieve/:id', billingController.getBillings);

export default billingRouter;
