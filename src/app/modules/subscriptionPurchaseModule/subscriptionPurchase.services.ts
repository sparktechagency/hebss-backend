import { ISubscriptionPurchase } from './subscriptionPurchase.interface';
import SubscriptionPurchase from './subscriptionPurchase.model';

class SubscriptionPurchaseService {
  async createSubscriptionPurchase(subscriptionPurchaseData: ISubscriptionPurchase) {
    const subscriptionPurchase = new SubscriptionPurchase(subscriptionPurchaseData);
    return await subscriptionPurchase.save();
  }

  async getSubscriptionPurchaseById(id: string) {
    return await SubscriptionPurchase.findById(id);
  }

  async getSubscriptionPurchaseByUserId(id: string) {
    return await SubscriptionPurchase.findOne({ user: id });
  }

  async getSubscriptionPurchasesBySubscriptionType(type: string) {
    return await SubscriptionPurchase.find({ 'subscription.type': type });
  }

  async updateSubscriptionPurchase(id: string, subscriptionPurchaseData: ISubscriptionPurchase) {
    return await SubscriptionPurchase.findByIdAndUpdate(id, subscriptionPurchaseData, { new: true });
  }
}

export default new SubscriptionPurchaseService();
