"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
var Gender;
(function (Gender) {
    Gender["Male"] = "male";
    Gender["Female"] = "female";
    Gender["Other"] = "other";
})(Gender || (Gender = {}));
const userSchema = new mongoose_1.default.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required!'],
        lowercase: true,
        trim: true,
        validate: {
            validator: (value) => validator_1.default.isEmail(value),
            message: (props) => `${props.value} is not a valid email!`,
        },
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        trim: true,
        minlength: [8, 'Password must be at least 8 characters'],
        required: [true, 'Password is required!'],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user',
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'blocked', 'disabled'],
            message: '{VALUE} is not accepted as a status value. Use active/blocked/disabled.',
        },
        default: 'active',
    },
    verification: {
        code: {
            type: String,
            default: null,
        },
        expireDate: {
            type: Date,
            default: null,
        },
    },
    googleId: {
        type: String,
        default: null,
    },
    facebookId: {
        type: String,
        default: null,
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local',
    },
    survey: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'survey',
    },
    subscription: {
        purchaseId: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'subscriptionPurchase',
            default: null,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
    stripePaymentMethodId: {
        type: String,
        default: null,
    },
    shippingAddress: {
        state: String,
        street: String,
        city: String,
        country: String,
        zipCode: String,
    },
}, {
    timestamps: true,
});
userSchema.pre('save', function (next) {
    var _a;
    const saltRounds = 10;
    if (this.isModified('password')) {
        this.password = bcrypt_1.default.hashSync(this.password, saltRounds);
    }
    if (this.isModified('verification.code') && ((_a = this.verification) === null || _a === void 0 ? void 0 : _a.code)) {
        this.verification.code = bcrypt_1.default.hashSync(this.verification.code, saltRounds);
    }
    next();
});
userSchema.methods.comparePassword = function (userPlanePassword) {
    return bcrypt_1.default.compareSync(userPlanePassword, this.password);
};
userSchema.methods.compareVerificationCode = function (userPlaneCode) {
    return bcrypt_1.default.compareSync(userPlaneCode, this.verification.code);
};
userSchema.index({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text',
});
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
