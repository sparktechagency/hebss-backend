"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = __importDefault(require("zod"));
// Shared validation for gender and role enums
const genderEnum = zod_1.default.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required!',
    invalid_type_error: 'Invalid gender type. Allowed values are male, female, or other.',
});
const statusEnum = zod_1.default.enum(['active', 'blocked', 'disabled'], {
    required_error: 'Status is required!',
    invalid_type_error: 'Invalid status type. Allowed values are active, blocked, or disabled.',
});
// Validation schema for user creation
const createUserZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        firstName: zod_1.default
            .string({
            required_error: 'First name is required!',
        })
            .min(1, 'First name must not be empty!'),
        lastName: zod_1.default
            .string({
            required_error: 'Last name is required!',
        })
            .min(1, 'Last name must not be empty!'),
        email: zod_1.default
            .string({
            required_error: 'Email is required!',
        })
            .email('Invalid email address!'),
        phone: zod_1.default
            .string({
            required_error: 'Phone number is required!',
        })
            .min(10, 'Phone number must be at least 10 digits!')
            .regex(/^\d+$/, 'Phone number must only contain digits!'),
        password: zod_1.default
            .string({
            required_error: 'Password is required!',
        })
            .min(8, 'Password must be at least 8 characters!'),
        isEmailVerified: zod_1.default.boolean().optional().default(false),
        status: statusEnum.optional().default('active'),
        verification: zod_1.default
            .object({
            code: zod_1.default.string().nullable().optional(),
            expireDate: zod_1.default.date().nullable().optional(),
        })
            .optional(),
        survey: zod_1.default.string().optional(), // Assuming ObjectId will be passed as a string
        // gender: genderEnum,
    }),
});
// Validation schema for fetching a specific user by ID
const getSpecificUserZodSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({
            required_error: 'User ID is missing in request params!',
        }),
    }),
});
const UserValidationZodSchema = {
    createUserZodSchema,
    getSpecificUserZodSchema,
};
exports.default = UserValidationZodSchema;
