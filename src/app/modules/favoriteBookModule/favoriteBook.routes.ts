import { Router } from 'express';
import favoriteBookController from './faboriteBook.controllers';

const favoriteBookRouter = Router();

// get favorite books of a user
favoriteBookRouter.get('/retrieve/user/:id', favoriteBookController.retrieveFavoriteBooksByUser);

// add book to favorite
favoriteBookRouter.post('/add/new/:id',favoriteBookController.addBookToFavorite);

// remove book from favorite
favoriteBookRouter.post('/remove/:id', favoriteBookController.removeBookFromFavorite)
export default favoriteBookRouter;

