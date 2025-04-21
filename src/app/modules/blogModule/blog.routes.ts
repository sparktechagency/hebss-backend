import { Router } from 'express';
import BlogController from './blog.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const blogRouter = Router();

blogRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

blogRouter.post('/create', BlogController.createBlog);
blogRouter.get('/retrieve/all', BlogController.getBlogs);
blogRouter.get('/retrieve/:id', BlogController.getBlogById);
blogRouter.patch('/update/:id', BlogController.updateBlog);
blogRouter.delete('/delete/:id', BlogController.deleteBlog);

export default blogRouter;