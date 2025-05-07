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
    })
        .select('-password -verification');
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
exports.default = {
    createUser,
    getSpecificUser,
    getSpecificUserByEmail,
    updateSpecificUser,
    // deleteSpecificUser,
    getAllUser,
};
