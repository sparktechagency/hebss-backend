import Billing from './billing.model';

const createBilling = async (billinData: any) => {
  return await Billing.create(billinData);
};

const getBillings = async (userId: string,skip: number, limit: number) => {
  return await Billing.find({user: userId}).skip(skip).limit(limit).populate('contentId');
};

export default {
  createBilling,
  getBillings,
};
