import { IGrade } from './grade.interface';
import Grade from './grade.model';

class GradeService {
  async createGrade(gradeData: IGrade) {
    const grade = new Grade(gradeData);
    return await grade.save();
  }

  async getGrades() {
    return await Grade.find();
  }

  async getGradeById(id: string) {
    return await Grade.findById(id);
  }

  async updateGrade(id: string, gradeData: IGrade) {
    return await Grade.findByIdAndUpdate(id, gradeData, { new: true });
  }

  async deleteAllGrades() {
    return await Grade.deleteMany({});
  }
}

export default new GradeService();
