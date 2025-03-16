// service class including methods for create, get specific, get all, delete order and update order status services
import { IOrder } from './order.interface';
import Order from './order.model';

class OrderService {
    async createOrder(orderData: IOrder) {
      const order = new Order(orderData);
      return await order.save();
    }
  
    async getOrders() {
      return await Order.find();
    }
  
    async getOrderById(id: string) {
      return await Order.findById(id);
    }
  
    async updateOrder(id: string, status: string) {
      return await Order.findByIdAndUpdate(id, { status }, { new: true });
    }
  
    async deleteOrder(id: string) {
      return await Order.findByIdAndDelete(id);
    }

    async getLastOrder() {
      return await Order.findOne().sort({ _id: -1 });
    }
  }
  
  export default new OrderService();
