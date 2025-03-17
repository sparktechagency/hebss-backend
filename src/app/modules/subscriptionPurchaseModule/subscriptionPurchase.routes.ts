import { Router } from 'express';
import SubscriptionPurchaseController from './subscriptionPurchase.controllers';

const subscriptionPurchaseRouter = Router();

subscriptionPurchaseRouter.post('/create', SubscriptionPurchaseController.createSubscriptionPurchase);
subscriptionPurchaseRouter.get('/retrieve/:id', SubscriptionPurchaseController.getSubscriptionPurchaseById);
subscriptionPurchaseRouter.get('/retrieve/user/:id', SubscriptionPurchaseController.getSubscriptionPurchaseByUserId);
subscriptionPurchaseRouter.get('/all/retrieve', SubscriptionPurchaseController.getSubscriptionPurchasesBySubscriptionType);

export default subscriptionPurchaseRouter;