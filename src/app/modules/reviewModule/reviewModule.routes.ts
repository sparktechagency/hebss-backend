import { Router } from 'express';
import ReviewController from './reviewModule.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const reviewRouter = Router();

reviewRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

reviewRouter.post('/create', ReviewController.createReview);
reviewRouter.get('/retrieve/box/:boxId', ReviewController.getReviewsByBoxId);
reviewRouter.get('/retrieve/provider/:providerId', ReviewController.getReviewsByProviderId);
reviewRouter.get('/retrieve/all', ReviewController.getAllReviews);
reviewRouter.get('/retrieve/:id', ReviewController.getReviewById);
reviewRouter.delete('/delete/:id', ReviewController.deleteReview);

export default reviewRouter;