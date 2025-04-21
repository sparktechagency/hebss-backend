import { Router } from 'express';
import OrderController from './order.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const orderRouter = Router();

orderRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

orderRouter.post('/create', OrderController.createOrder);
orderRouter.get('/retrieve', OrderController.getOrders);
orderRouter.get('/retrieve/:id', OrderController.getOrderById);
orderRouter.patch('/update/:id', OrderController.updateOrder);
orderRouter.delete('/delete/:id', OrderController.deleteOrder);

export default orderRouter;
