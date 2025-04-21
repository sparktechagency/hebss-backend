import { Router } from 'express';
import BoxController from './box.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const boxRouter = Router();

boxRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

boxRouter.post('/create', BoxController.createBox);
boxRouter.get('/retrieve', BoxController.getBoxes);
boxRouter.patch('/customize/:id', BoxController.customizeBookInBox);

export default boxRouter;
