"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("./user.model"));
// service for create new user
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.create(data);
});
// service for get specific user
const getSpecificUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({ _id: id })
        .populate({
        path: 'survey',
        select: '',
    })
        .select('-password -verification');
});
const getSpecificUserByCustomerId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({ stripeCustomerId: id })
        .populate({
        path: 'survey',
        select: '',
    })
        .select('-password -verification');
});
// service for get specific user
const getAllUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const matchCondition = {};
    if (query) {
        matchCondition.$text = { $search: query }; // Add search criteria if provided
    }
    return yield user_model_1.default.find(matchCondition)
        .populate({
        path: 'survey',
        select: '',
        populate: {
            path: 'category',
            select: 'title',
        },
    })
        .select('-password -verification').sort({ createdAt: -1 });
});
// service for get specific user
const getSpecificUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({ email })
        .populate({
        path: 'survey',
        select: '',
    })
        .select('-password');
});
// service for update specific user
const updateSpecificUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOneAndUpdate({ _id: id }, data);
});
const getAllPurchedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.aggregate([
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
});
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
const updateShippingAddress = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOneAndUpdate({ _id: id }, data);
});
exports.default = {
    createUser,
    getSpecificUser,
    getSpecificUserByEmail,
    updateSpecificUser,
    getAllUser,
    getSpecificUserByCustomerId,
    getAllPurchedUsers,
    updateShippingAddress,
};
