import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import FavoriteBook from './favoriteBook.model';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// service for get favorite books of a user
const getFavoriteBooksByUserId = async (userId: string) => {
  return await FavoriteBook.findOne({ user: userId });
};

// controller for add book in favoritebook list by user
const addBookToFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bookId } = req.body;
  let favoriteBooks = await getFavoriteBooksByUserId(id);

  if (!favoriteBooks) {
    const newFavoriteBooks = new FavoriteBook({ user: id, books: [bookId] });
    await newFavoriteBooks.save();
    favoriteBooks = newFavoriteBooks;
  } else {
    if (!favoriteBooks.books.includes(bookId)) {
      favoriteBooks.books.push(bookId);
      await favoriteBooks.save();
    }
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Book added to favorite successfully',
    data: favoriteBooks,
  });
});

// controller for remove book from favoritebook list by user
const removeBookFromFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bookId } = req.body;
  const favoriteBooks = await getFavoriteBooksByUserId(id);

  if (!favoriteBooks) {
    throw new CustomError.NotFoundError('Favorite books not found!');
  }

  if (favoriteBooks.books.includes(bookId)) {
    favoriteBooks.books = favoriteBooks.books.filter((book) => book.toString() !== bookId);
    await favoriteBooks.save();
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Book removed from favorite successfully',
  });
});

// controller for get favorite books of a user
const retrieveFavoriteBooksByUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const favoriteBooks = await getFavoriteBooksByUserId(id);

  if (!favoriteBooks) {
    throw new CustomError.NotFoundError('Favorite books not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Favorite books retrieved successfully',
    data: favoriteBooks,
  });
});

export default {
  retrieveFavoriteBooksByUser,
  addBookToFavorite,
  removeBookFromFavorite,
};
