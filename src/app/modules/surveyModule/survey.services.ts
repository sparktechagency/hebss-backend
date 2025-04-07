import { ISurvey } from './survey.interface';
import Survey from './survey.model';

class SurveyService {
  async createSurvey(surveyData: ISurvey) {
    const survey = new Survey(surveyData);
    return await survey.save();
  }

  async getSurveyById(id: string) {
    return await Survey.findById(id);
  }

}

export default new SurveyService();
