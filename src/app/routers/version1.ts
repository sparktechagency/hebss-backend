import express from 'express';
import userRouter from '../modules/userModule/user.routes';
import adminRouter from '../modules/adminModule/admin.routes';
import userAuthRouter from '../modules/authModule/userAuthModule/auth.routes';
import adminAuthRouter from '../modules/authModule/adminAuthModule/auth.routes';
import aboutUsRouter from '../modules/aboutUsModule/abountUs.routes';
import privacyPolicyRouter from '../modules/privacyPolicyModule/privacyPolicy.routes';
import termsConditionRouter from '../modules/termsConditionModule/termsCondition.routes';
import contactUsRouter from '../modules/contactUsModule/contactUs.routes';
import faqRouter from '../modules/faqModule/faq.routes';
import teamRouter from '../modules/teamModule/team.routes';
import blogRouter from '../modules/blogModule/blog.routes';
import categoryRouter from '../modules/categoryModule/category.routes';
import gradeRouter from '../modules/gradeModule/grade.routes';
import collectionRouter from '../modules/collectionModule/collection.routes';
import bookRouter from '../modules/bookModule/book.routes';
import boxRouter from '../modules/boxModule/box.routes';
import orderRouter from '../modules/orderModule/order.routes';
import subscriptionRouter from '../modules/subscriptionModule/subscription.routes';
import subscriptionPurchaseRouter from '../modules/subscriptionPurchaseModule/subscriptionPurchase.routes';
import invoiceRouter from '../modules/invoiceModule/invoice.routes';
import surveyRouter from '../modules/surveyModule/survey.routes';
import recommendationRouter from '../modules/recommendationModule/recommendation.routes';
import reviewRouter from '../modules/reviewModule/reviewModule.routes';
import favoriteBookRouter from '../modules/favoriteBookModule/favoriteBook.routes';

const routersVersionOne = express.Router();

// user
routersVersionOne.use('/user', userRouter);
routersVersionOne.use('/admin', adminRouter);

// auth
routersVersionOne.use('/user/auth', userAuthRouter);
routersVersionOne.use('/admin/auth', adminAuthRouter);

// app
routersVersionOne.use('/team', teamRouter);
routersVersionOne.use('/blog', blogRouter);
routersVersionOne.use('/category', categoryRouter);
routersVersionOne.use('/grade', gradeRouter);
routersVersionOne.use('/collection', collectionRouter);
routersVersionOne.use('/book', bookRouter);
routersVersionOne.use('/box', boxRouter);
routersVersionOne.use('/order', orderRouter);
routersVersionOne.use('/subscription', subscriptionRouter);
routersVersionOne.use('/subscription-purchase', subscriptionPurchaseRouter);
routersVersionOne.use('/invoice', invoiceRouter);
routersVersionOne.use('/survey', surveyRouter);
routersVersionOne.use('/recommendation', recommendationRouter);
routersVersionOne.use('/review', reviewRouter);
routersVersionOne.use('/favorite-book', favoriteBookRouter);

// settings
routersVersionOne.use('/about-us', aboutUsRouter);
routersVersionOne.use('/privacy-policy', privacyPolicyRouter);
routersVersionOne.use('/terms-condition', termsConditionRouter);
routersVersionOne.use('/contact-us', contactUsRouter);
routersVersionOne.use('/faq', faqRouter);

export default routersVersionOne;
