import Billing from './billing.model';

const createBilling = async (billinData: any) => {
  return await Billing.create(billinData);
};

const getBillings = async (userId: string,skip: number, limit: number) => {
  return await Billing.find({user: userId}).populate('contentId').sort('-createdAt');
};

export default {
  createBilling,
  getBillings,
};
