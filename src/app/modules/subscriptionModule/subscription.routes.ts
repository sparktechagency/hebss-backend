import { Router } from 'express';
import SubscriptionController from './subscription.controllers';

const subscriptionRouter = Router();

subscriptionRouter.post('/create', SubscriptionController.createSubscription);
subscriptionRouter.get('/retrieve', SubscriptionController.getSubscriptions);
subscriptionRouter.get('/retrieve/:id', SubscriptionController.getSubscriptionById);
subscriptionRouter.patch('/update/:id', SubscriptionController.updateSubscription);
subscriptionRouter.delete('/delete/:id', SubscriptionController.deleteSubscription);

export default subscriptionRouter;
