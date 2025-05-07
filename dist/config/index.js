"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
dotenv_1.default.config({
    path: path_1.default.join(process.cwd(), '.env'),
});
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['production', 'development', 'test']).default('development'),
    PORT: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().default(5003)),
    MONGODB_URL: zod_1.z.string().min(1, 'MongoDB connection URL is required'),
    SERVER_URL: zod_1.z.string().min(1, 'Server url is required'),
    JWT_ACCESS_TOKEN_SECRET: zod_1.z.string().min(1, 'Access token secret key is required'),
    JWT_ACCESS_TOKEN_EXPIRESIN: zod_1.z.string().default('14d'),
    JWT_REFRESH_TOKEN_SECRET: zod_1.z.string().min(1, 'Refresh token secret key is required'),
    JWT_REFRESH_TOKEN_EXPIRESIN: zod_1.z.string().default('30d'),
    // referral_point: z.string().min(1, 'Referral point is required'),
    GMAIL_APP_USER: zod_1.z.string().email('Invalid email format'),
    GMAIL_APP_PASSWORD: zod_1.z.string().min(1, 'Gmail app password is required'),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1, 'Google client ID is required'),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1, 'Google client secret is required'),
    FACEBOOK_CLIENT_ID: zod_1.z.string().min(1, 'Facebook client ID is required'),
    FACEBOOK_CLIENT_SECRET: zod_1.z.string().min(1, 'Facebook client secret is required'),
    GOOGLE_CALLBACK_URL: zod_1.z.string().min(1, 'Google callback URL is required'),
    FACEBOOK_REDIRECT_URL: zod_1.z.string().min(1, 'Facebook redirect URL is required'),
    FRONTEND_URL: zod_1.z.string().min(1, 'Frontend URL is required'),
});
const envVars = envSchema.parse(process.env);
exports.default = {
    node_env: envVars.NODE_ENV,
    server_port: envVars.PORT,
    mongodb_url: envVars.MONGODB_URL,
    server_url: envVars.SERVER_URL,
    jwt_access_token_secret: envVars.JWT_ACCESS_TOKEN_SECRET,
    jwt_access_token_expiresin: envVars.JWT_ACCESS_TOKEN_EXPIRESIN,
    jwt_refresh_token_secret: envVars.JWT_REFRESH_TOKEN_SECRET,
    jwt_refresh_token_expiresin: envVars.JWT_REFRESH_TOKEN_EXPIRESIN,
    // referral point
    // referral_point: process.env.REFERRAL_POINT,
    gmail_app_user: envVars.GMAIL_APP_USER,
    gmail_app_password: envVars.GMAIL_APP_PASSWORD,
    google_client_id: envVars.GOOGLE_CLIENT_ID,
    google_client_secret: envVars.GOOGLE_CLIENT_SECRET,
    facebook_client_id: envVars.FACEBOOK_CLIENT_ID,
    facebook_client_secret: envVars.FACEBOOK_CLIENT_SECRET,
    google_callback_url: envVars.GOOGLE_CALLBACK_URL,
    facebook_redirect_url: envVars.FACEBOOK_REDIRECT_URL,
    frontend_url: envVars.FRONTEND_URL,
};
