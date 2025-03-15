import { Router } from 'express';
import BookController from './book.controllers';

const bookRouter = Router();

bookRouter.post('/create', BookController.createBook);
bookRouter.get('/retrieve', BookController.getBooks);
bookRouter.get('/retrieve/:id', BookController.getBookById);
bookRouter.patch('/update/:id', BookController.updateBook);
bookRouter.delete('/delete/:id', BookController.deleteBook);

export default bookRouter;
