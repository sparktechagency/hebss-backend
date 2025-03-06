import express from 'express';
import GradeControllers from './grade.controllers';

const gradeRouter = express.Router();

gradeRouter.post('/create', GradeControllers.createGrade);
gradeRouter.get('/retrieve', GradeControllers.getGrades);
gradeRouter.get('/retrieve/:id', GradeControllers.getGradeById);
gradeRouter.patch('/update/:id', GradeControllers.updateGrade);
gradeRouter.delete('/delete/all', GradeControllers.deleteAllGrades);

export default gradeRouter;
