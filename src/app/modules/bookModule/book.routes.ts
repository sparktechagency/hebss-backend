import { Router } from 'express';
import BookController from './book.controllers';
import { ENUM_USER_ROLE } from '../../../enums/user';
import authentication from '../../middlewares/authorization';

const bookRouter = Router();

// bookRouter.use(authentication(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.USER))

bookRouter.post('/create', BookController.createBook);
bookRouter.get('/retrieve', BookController.getBooks);
bookRouter.get('/retrieve/:id', BookController.getBookById);
bookRouter.patch('/update/:id', BookController.updateBook);
bookRouter.delete('/delete/:id', BookController.deleteBook);

export default bookRouter;
