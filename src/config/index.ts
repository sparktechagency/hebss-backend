import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  PORT: z.preprocess((val) => Number(val), z.number().default(5003)),
  MONGODB_URL: z.string().min(1, 'MongoDB connection URL is required'),
  SERVER_URL: z.string().min(1, 'Server url is required'),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(1, 'Access token secret key is required'),
  JWT_ACCESS_TOKEN_EXPIRESIN: z.string().default('14d'),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(1, 'Refresh token secret key is required'),
  JWT_REFRESH_TOKEN_EXPIRESIN: z.string().default('30d'),

  referral_point: z.string().min(1, 'Referral point is required'),

  GMAIL_APP_USER: z.string().email('Invalid email format'),
  GMAIL_APP_PASSWORD: z.string().min(1, 'Gmail app password is required'),

  GOOGLE_CLIENT_ID: z.string().min(1, 'Google client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google client secret is required'),
  
  FACEBOOK_CLIENT_ID: z.string().min(1, 'Facebook client ID is required'),
  FACEBOOK_CLIENT_SECRET: z.string().min(1, 'Facebook client secret is required'),

  GOOGLE_CALLBACK_URL: z.string().min(1, 'Google callback URL is required'),
  FACEBOOK_REDIRECT_URL: z.string().min(1, 'Facebook redirect URL is required'),
  FRONTEND_URL: z.string().min(1, 'Frontend URL is required'),
});

const envVars = envSchema.parse(process.env);

export default {
  node_env: envVars.NODE_ENV,
  server_port: envVars.PORT,
  mongodb_url: envVars.MONGODB_URL,
  server_url: envVars.SERVER_URL,

  jwt_access_token_secret: envVars.JWT_ACCESS_TOKEN_SECRET,
  jwt_access_token_expiresin: envVars.JWT_ACCESS_TOKEN_EXPIRESIN,
  jwt_refresh_token_secret: envVars.JWT_REFRESH_TOKEN_SECRET,
  jwt_refresh_token_expiresin: envVars.JWT_REFRESH_TOKEN_EXPIRESIN,

  // referral point
  referral_point: process.env.REFERRAL_POINT,

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
