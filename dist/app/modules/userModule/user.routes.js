"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controllers_1 = __importDefault(require("./user.controllers"));
const user_validation_1 = __importDefault(require("./user.validation"));
const requestValidator_1 = __importDefault(require("../../middlewares/requestValidator"));
const userRouter = express_1.default.Router();
userRouter.post('/create', (0, requestValidator_1.default)(user_validation_1.default.createUserZodSchema), user_controllers_1.default.createUser);
userRouter.get('/retrive/all', user_controllers_1.default.getAllUser);
userRouter.get('/retrive/:id', (0, requestValidator_1.default)(user_validation_1.default.getSpecificUserZodSchema), user_controllers_1.default.getSpecificUser);
userRouter.patch('/update/:id', 
//   authentication('user', 'admin'),
(0, requestValidator_1.default)(user_validation_1.default.getSpecificUserZodSchema), user_controllers_1.default.updateSpecificUser);
// userRouter.delete(
//   '/delete/:id',
//   //   authentication('user', 'admin'),
//   requestValidator(UserValidationZodSchema.getSpecificUserZodSchema),
//   userControllers.deleteSpecificUser,
// );
// userRouter.patch('/update/profile-picture/:id', authentication('patient', 'therapist'), requestValidator(UserValidationZodSchema.getSpecificUserZodSchema), userControllers.changeUserProfileImage)
// send email to specific user
userRouter.post('/send-email/indivisual/:id', (0, requestValidator_1.default)(user_validation_1.default.getSpecificUserZodSchema), user_controllers_1.default.sendEmailToSpecificUser);
// send email to all users
userRouter.post('/send-email/bulk', user_controllers_1.default.sendEmailToAllUsers);
// update shipping address
userRouter.patch('/update/shipping-address/:id', (0, requestValidator_1.default)(user_validation_1.default.getSpecificUserZodSchema), user_controllers_1.default.updateShippingAddress);
exports.default = userRouter;
