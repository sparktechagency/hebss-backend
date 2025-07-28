import { ObjectId, Types } from 'mongoose';
import IUser from './user.interface';
import User from './user.model';
import Box from '../boxModule/box.model';

// service for create new user
const createUser = async (data: IUser) => {
  return await User.create(data);
};

// service for get specific user
const getSpecificUser = async (id: string): Promise<IUser> => {
  return await User.findOne({ _id: id })
    .populate({
      path: 'survey',
      select: '',
    })
    .select('-password -verification');
};
const getSpecificUserByCustomerId = async (id: string): Promise<IUser> => {
  return await User.findOne({ stripeCustomerId: id })
    .populate({
      path: 'survey',
      select: '',
    })
    .select('-password -verification');
};

// service for get specific user
const getAllUser = async (query: string): Promise<IUser[]> => {
  const matchCondition: any = {};

  if (query) {
    matchCondition.$text = { $search: query }; // Add search criteria if provided
  }

  return await User.find(matchCondition)
    .populate({
      path: 'survey',
      select: '',
    })
    .select('-password -verification').sort({ createdAt: -1 });
};

// service for get specific user
const getSpecificUserByEmail = async (email: string): Promise<IUser> => {
  return await User.findOne({ email })
    .populate({
      path: 'survey',
      select: '',
    })
    .select('-password');
};

// service for update specific user
const updateSpecificUser = async (id: string, data: Partial<IUser>) => {
  return await User.findOneAndUpdate({ _id: id }, data);
};

const getAllPurchedUsers = async () => {
  const users = await User.aggregate([
    // 1. Filter active users with required fields
    {
      $match: {
        status: 'active',
        'subscription.isActive': true,
        'subscription.purchaseId': { $ne: null },
        stripeCustomerId: { $ne: null },
      },
    },

    // 2. Lookup related survey
    {
      $lookup: {
        from: 'surveys',
        localField: '_id',
        foreignField: 'user',
        as: 'survey',
      },
    },

    // 3. Unwind the survey array (get single survey)
    {
      $unwind: {
        path: '$survey',
        preserveNullAndEmptyArrays: true, // keep user even if no survey
      },
    },

    // 4. Lookup box using survey.category
    {
      $lookup: {
        from: 'boxes',
        localField: 'survey.category',
        foreignField: 'category',
        as: 'box',
      },
    },

    // 5. Unwind the box array
    {
      $unwind: {
        path: '$box',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 6. Final output structure
    {
      $project: {
        name: 1,
        email: 1,
        stripeCustomerId: 1,
        subscription: 1,
        survey: 1,
        boxId: '$box._id',
      },
    },
  ]);

  return users;
};

// service for delete specific user
// const deleteSpecificUser = async (id: string, role: string) => {
//   await User.deleteOne({ _id: id });
//   if (role === 'patient') {
//     await PatientProfile.deleteOne({ user: id });
//   } else if (role === 'therapist') {
//     await TherapistProfile.deleteOne({ user: id });
//   } else {
//     return false;
//   }
//   return true;
// };

const updateShippingAddress = async (id: string, data: Partial<IUser>) => {
  return await User.findOneAndUpdate({ _id: id }, data);
};

export default {
  createUser,
  getSpecificUser,
  getSpecificUserByEmail,
  updateSpecificUser,
  getAllUser,
  getSpecificUserByCustomerId,
  getAllPurchedUsers,
  updateShippingAddress,
};
