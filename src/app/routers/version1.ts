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

// settings
routersVersionOne.use('/about-us', aboutUsRouter);
routersVersionOne.use('/privacy-policy', privacyPolicyRouter);
routersVersionOne.use('/terms-condition', termsConditionRouter);
routersVersionOne.use('/contact-us', contactUsRouter);
routersVersionOne.use('/faq', faqRouter);

export default routersVersionOne;
