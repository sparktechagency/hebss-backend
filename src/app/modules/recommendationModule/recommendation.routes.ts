import express from 'express';
import recommendationControllers from './recommendation.controllers';

const recommendationRouter = express.Router();

recommendationRouter.post('/create', recommendationControllers.createRecommendation);
recommendationRouter.get('/retrieve/:categoryId', recommendationControllers.getRecommendationByCategory);
recommendationRouter.patch('/update/:id', recommendationControllers.updateRecommendation);
recommendationRouter.delete('/delete/:id', recommendationControllers.deleteRecommendation);

export default recommendationRouter;