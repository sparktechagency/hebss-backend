import { Router } from 'express';
import OrderController from './order.controllers';

const orderRouter = Router();

orderRouter.post('/create', OrderController.createOrder);
orderRouter.get('/retrieve', OrderController.getOrders);
orderRouter.get('/retrieve/:id', OrderController.getOrderById);
orderRouter.patch('/update/:id', OrderController.updateOrder);
orderRouter.delete('/delete/:id', OrderController.deleteOrder);

export default orderRouter;
