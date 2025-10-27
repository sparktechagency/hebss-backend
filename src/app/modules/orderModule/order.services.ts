// service class including methods for create, get specific, get all, delete order and update order status services
import { IOrder } from './order.interface';
import Order from './order.model';

class OrderService {
    async createOrder(orderData: Partial<IOrder>) {
      return await Order.create(orderData);
    }
  
    async getOrders(searchTerm: string, skip: number, limit: number) {
      const search: any = {};
    
      if (searchTerm) {
        search.$text = { $search: searchTerm };
      }
    // console.log(search)
      return await Order.find(search).sort('-updatedAt').skip(skip).limit(limit).populate({
        path: 'items.itemId',
        select: 'name price coverImage',
      });
    }
    async countOrders() {
      return await Order.countDocuments();
    }
  
    async getOrderById(id: string) {
      return await Order.findById(id);
    }
    async getOrderBySessionId(sessionId: string) {
      return await Order.findOne({ sessionId });
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
