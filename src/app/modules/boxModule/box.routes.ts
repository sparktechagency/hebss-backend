import { Router } from 'express';
import BoxController from './box.controllers';

const boxRouter = Router();

boxRouter.post('/create', BoxController.createBox);
boxRouter.get('/retrieve', BoxController.getBoxes);
boxRouter.patch('/customize/:id', BoxController.customizeBookInBox);

export default boxRouter;
