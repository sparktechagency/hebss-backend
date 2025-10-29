import { ObjectId } from 'mongoose';
import { ISurvey } from './survey.interface';
import Survey from './survey.model';

class SurveyService {
  async createSurvey(surveyData: ISurvey) {
    const survey = new Survey(surveyData);
    return await survey.save();
  }

  async getSurveyById(id: ObjectId) {
    return await Survey.findOne({email: id});
  }

  async getSurveyBySurveyId(id: ObjectId) {
    return await Survey.findOne({_id: id});
  }

  // async getSurveyByUserId(id: string) {
  //   return await Survey.findOne({user: id});
  // }

}

export default new SurveyService();
