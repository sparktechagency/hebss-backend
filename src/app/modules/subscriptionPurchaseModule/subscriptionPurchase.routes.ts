import { Router } from 'express';
import SubscriptionPurchaseController from './subscriptionPurchase.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const subscriptionPurchaseRouter = Router();

subscriptionPurchaseRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

subscriptionPurchaseRouter.post('/create', SubscriptionPurchaseController.createSubscriptionPurchase);
subscriptionPurchaseRouter.get('/retrieve/:id', SubscriptionPurchaseController.getSubscriptionPurchaseById);
subscriptionPurchaseRouter.get('/retrieve/user/:id', SubscriptionPurchaseController.getSubscriptionPurchaseByUserId);
subscriptionPurchaseRouter.get('/all/retrieve', SubscriptionPurchaseController.getSubscriptionPurchasesBySubscriptionType);

export default subscriptionPurchaseRouter;