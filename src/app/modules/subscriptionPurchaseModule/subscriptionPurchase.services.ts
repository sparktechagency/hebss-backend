import { ISubscriptionPurchase } from './subscriptionPurchase.interface';
import SubscriptionPurchase from './subscriptionPurchase.model';

class SubscriptionPurchaseService {
  async createSubscriptionPurchase(subscriptionPurchaseData: Partial<ISubscriptionPurchase>) {
    console.log("subscriptionPurchaseData", subscriptionPurchaseData)
    return await SubscriptionPurchase.create(subscriptionPurchaseData);
  }

  async getSubscriptionPurchaseById(id: string) {
    return await SubscriptionPurchase.findById(id);
  }

  async getSubscriptionPurchaseByPriceId(priceId: string) {
    return await SubscriptionPurchase.findOne({ 'subscription.priceId': priceId });
  }

  async getSubscriptionPurchaseByUserId(id: string) {
    return await SubscriptionPurchase.findOne({ user: id });
  }

  async getSubscriptionPurchasesBySubscriptionType(type: string) {
    return await SubscriptionPurchase.find({ 'subscription.type': type });
  }

  async updateSubscriptionPurchase(id: string, subscriptionPurchaseData: Partial<ISubscriptionPurchase>) {
    return await SubscriptionPurchase.findByIdAndUpdate(id, subscriptionPurchaseData, { new: true });
  }

  async getAllUsersBySubscriptionId(priceId: string) {
    return await SubscriptionPurchase.find({ "subscription.priceId": priceId }).populate({
      path: 'user',
      select: 'email phone status gender survey',
      populate: {
        path: 'survey',
        select: ''
      }
    });
  }
}

export default new SubscriptionPurchaseService();
