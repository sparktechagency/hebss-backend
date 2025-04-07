import express from 'express';
import SurveyControllers from './survey.controllers';

const surveyRouter = express.Router();

surveyRouter.post('/create', SurveyControllers.createSurvey);

export default surveyRouter;
