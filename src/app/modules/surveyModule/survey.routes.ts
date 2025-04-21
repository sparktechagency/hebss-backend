import express from 'express';
import SurveyControllers from './survey.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const surveyRouter = express.Router();

surveyRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

surveyRouter.post('/create', SurveyControllers.createSurvey);

export default surveyRouter;
