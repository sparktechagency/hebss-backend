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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const IdGenerator_1 = __importDefault(require("../../../utils/IdGenerator"));
const errors_1 = __importDefault(require("../../errors"));
const user_services_1 = __importDefault(require("./user.services"));
const sendEmail_1 = __importDefault(require("../../../utils/sendEmail"));
const healper_jwt_1 = __importDefault(require("../../../healpers/healper.jwt"));
const config_1 = __importDefault(require("../../../config"));
const asyncHandler_1 = __importDefault(require("../../../shared/asyncHandler"));
// controller for create new user
const createUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userData = req.body;
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 30);
    userData.verification = {
        code: IdGenerator_1.default.generateNumberId(),
        expireDate,
    };
    // token for social user
    let accessToken, refreshToken;
    if (userData.isSocial) {
        userData.isEmailVerified = true;
        const payload = {
            email: userData.email,
            role: userData.role,
        };
        accessToken = healper_jwt_1.default.createToken(payload, config_1.default.jwt_access_token_secret, config_1.default.jwt_access_token_expiresin);
        refreshToken = healper_jwt_1.default.createToken(payload, config_1.default.jwt_refresh_token_secret, config_1.default.jwt_refresh_token_expiresin);
    }
    const user = yield user_services_1.default.createUser(userData);
    if (!user) {
        throw new errors_1.default.BadRequestError('Failed to create new user!');
    }
    const _b = user.toObject(), { password, verification } = _b, userInfoAcceptPass = __rest(_b, ["password", "verification"]);
    if (!userData.isSocial) {
        // send email verification mail
        const content = `Your email veirfication code is ${(_a = userData === null || userData === void 0 ? void 0 : userData.verification) === null || _a === void 0 ? void 0 : _a.code}`;
        // const verificationLink = `${server_base_url}/v1/auth/verify-email/${user._id}?userCode=${userData.verification.code}`
        // const content = `Click the following link to verify your email: ${verificationLink}`
        const mailOptions = {
            from: config_1.default.gmail_app_user,
            to: userData.email,
            subject: 'Illuminate Muslim Minds - Email Verification',
            text: content,
        };
        (0, sendEmail_1.default)(mailOptions);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        status: 'success',
        message: 'User creation successfull',
        data: Object.assign(Object.assign({}, userInfoAcceptPass), { accessToken, refreshToken }),
    });
}));
// service for get specific user by id
const getSpecificUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_services_1.default.getSpecificUser(id);
    if (!user) {
        throw new errors_1.default.NotFoundError('User not found!');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: 'success',
        message: 'User retrive successfull',
        data: user,
    });
}));
// service for get specific user by id
const getAllUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const users = yield user_services_1.default.getAllUser(query);
    const totalUsers = (users === null || users === void 0 ? void 0 : users.length) || 0;
    const totalPages = Math.ceil(totalUsers / limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: 'success',
        message: 'User retrive successfull',
        meta: {
            totalData: totalUsers,
            totalPage: totalPages,
            currentPage: page,
            limit: limit,
        },
        data: users,
    });
}));
// controller for delete specific user
// const deleteSpecificUser = asyncHandler(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { role } = req.user!;
//   const isDelete = await userServices.deleteSpecificUser(id, role);
//   if (!isDelete) {
//     throw new CustomError.BadRequestError('Failed to delete user!');
//   }
//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     status: 'success',
//     message: 'User delete successfull',
//   });
// });
// controller for update specific user
const updateSpecificUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userData = req.body;
    if (userData.password || userData.email || userData.isEmailVerified) {
        throw new errors_1.default.BadRequestError("You can't update email, verified status and password directly!");
    }
    const updatedUser = yield user_services_1.default.updateSpecificUser(id, userData);
    // console.log(updatedUser, updatedProfile)
    if (!(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.isModified)) {
        throw new errors_1.default.BadRequestError('Failed to update user!');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: 'success',
        message: 'User modified successfull',
    });
}));
// controller for send email to specific user
const sendEmailToSpecificUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { emailBody } = req.body;
    const user = yield user_services_1.default.getSpecificUser(id);
    if (!user) {
        throw new errors_1.default.NotFoundError('User not found!');
    }
    const mailOptions = {
        from: config_1.default.gmail_app_user,
        to: user.email,
        subject: emailBody === null || emailBody === void 0 ? void 0 : emailBody.subject,
        text: emailBody === null || emailBody === void 0 ? void 0 : emailBody.body,
    };
    (0, sendEmail_1.default)(mailOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: 'success',
        message: 'Email sent successfully',
    });
}));
// controller for send email to all users
const sendEmailToAllUsers = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailBody } = req.body;
    const users = yield user_services_1.default.getAllUser('');
    if (!(users === null || users === void 0 ? void 0 : users.length)) {
        throw new errors_1.default.NotFoundError('No users exist to send email!');
    }
    Promise.allSettled(users.map((user) => {
        const mailOptions = {
            from: config_1.default.gmail_app_user,
            to: user.email,
            subject: emailBody === null || emailBody === void 0 ? void 0 : emailBody.subject,
            text: emailBody === null || emailBody === void 0 ? void 0 : emailBody.body,
        };
        return (0, sendEmail_1.default)(mailOptions);
    }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: 'success',
        message: 'Email sent successfully',
    });
}));
exports.default = {
    createUser,
    getSpecificUser,
    getAllUser,
    // deleteSpecificUser,
    updateSpecificUser,
    // changeUserProfileImage,
    sendEmailToSpecificUser,
    sendEmailToAllUsers,
};
