import express from 'express';
import dashboardMatrixController from './dashboardMatrix.controller';

const dashboardMatrixRouter = express.Router();

dashboardMatrixRouter.get('/retrieve', dashboardMatrixController.retrieveDashboardMatrix);

export default dashboardMatrixRouter;
