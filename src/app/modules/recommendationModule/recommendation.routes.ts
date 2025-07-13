import express from 'express';
import recommendationControllers from './recommendation.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const recommendationRouter = express.Router();

// recommendationRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

recommendationRouter.post('/create', recommendationControllers.createRecommendation);
recommendationRouter.get('/retrieve/:dateOfBirth', recommendationControllers.getRecommendationByCategory);
recommendationRouter.patch('/update/:id', recommendationControllers.updateRecommendation);
recommendationRouter.delete('/delete/:id', recommendationControllers.deleteRecommendation);

export default recommendationRouter;