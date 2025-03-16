// service class including methods for create, get specific, get all, delete order and update order status services
import { ISubscription } from './subscription.interface';
import Subscription from './subscription.model';

class SubscriptionService {
  async createSubscription(subscriptionData: ISubscription) {
    const subscription = new Subscription(subscriptionData);
    return await subscription.save();
  }

  async getSubscriptions() {
    return await Subscription.find();
  }

  async getSubscriptionById(id: string) {
    return await Subscription.findById(id);
  }

  async updateSubscription(id: string, subscriptionData: ISubscription) {
    return await Subscription.findByIdAndUpdate(id, subscriptionData, { new: true });
  }

  async deleteSubscription(id: string) {
    return await Subscription.findByIdAndDelete(id);
  }
}

export default new SubscriptionService();
