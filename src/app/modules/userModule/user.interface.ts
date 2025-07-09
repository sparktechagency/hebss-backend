import { Document, Types } from 'mongoose';

enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  isEmailVerified: boolean;
  verification?: {
    code: string;
    expireDate: Date;
  };
  role: string;
  googleId?: string;
  facebookId?: string;
  provider?: 'local' | 'google' | 'facebook';
  survey: Types.ObjectId;
  subscription: {
    purchaseId: Types.ObjectId;
    isActive: boolean;
  }
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  shippingAddress: {
    state: string;
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };

  // method declarations
  comparePassword(userPlanePassword: string): boolean
  compareVerificationCode(userPlaneCode: string): boolean;
}

export default IUser;
