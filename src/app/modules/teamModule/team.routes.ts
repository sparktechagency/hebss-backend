import { Router } from 'express';
import TeamController from './team.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const teamRouter = Router();

teamRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

teamRouter.post('/create', TeamController.createTeam);
teamRouter.get('/retrieve/all', TeamController.getTeams);
teamRouter.get('/retrieve/:id', TeamController.getTeamById);
teamRouter.patch('/update/:id', TeamController.updateTeam);
teamRouter.delete('/delete/:id', TeamController.deleteTeam);

export default teamRouter;
