import express from 'express';
import authControllers from './auth.controllers';
import passport from 'passport';

const userAuthRouter = express.Router();

// outlet also can be login using the route
userAuthRouter.post('/login', authControllers.userLogin);

// Google auth routes
userAuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userAuthRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authControllers.googleCallback);

// Facebook auth routes
userAuthRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
userAuthRouter.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), authControllers.facebookCallback);

// route for resend email verification code
userAuthRouter.post('/email-verification/resend-code', authControllers.resendEmailVerificationCode);

// route for user email verify
userAuthRouter.post('/verify-email', authControllers.userEmailVerify);

// route for send password reset OTP
userAuthRouter.post('/forget-password/send-otp', authControllers.sendOTP);

// route for verify OTP
userAuthRouter.post('/verify-otp', authControllers.verifyOTP);

// route for reset password
userAuthRouter.post('/reset-password', authControllers.resetPassword);

// route for change password
userAuthRouter.post('/change-password', authControllers.changePassword);

// route for user stability (get new accesstoken)
userAuthRouter.post('/refresh-token', authControllers.getAccessTokenByRefreshToken);

export default userAuthRouter;
