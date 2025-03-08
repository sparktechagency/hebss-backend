import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import BookServices from './book.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import { CURRENCY_ENUM } from '../../../enums/currency';

class BookController {
  createBook = asyncHandler(async (req: Request, res: Response) => {
    const bookData = req.body;
    const files = req.files;

    if (files && files.coverImage) {
      const imagePath = await fileUploader(files as FileArray, `book-cover-image`, 'coverImage');
      bookData.coverImage = imagePath as string;
    }

    if (bookData) {
      // Price: If priceAmount is provided, set price
      if (bookData.priceAmount) {
        bookData.price = {
          amount: Number(bookData.priceAmount),
          currency: CURRENCY_ENUM.USD,
        };
      }

      // Quantity: If quantity is provided, ensure it's a number
      if (bookData.quantity) {
        bookData.quantity = Number(bookData.quantity);
      }

      // Set Arabic language flag
      if (bookData.language === 'arabic') {
        bookData.isArabic = true;
      }

      // Determine stock status based on quantity
      if (bookData.quantity > 0) {
        bookData.status = 'instock';
      } else if (bookData.quantity <= 0) {
        bookData.status = 'outofstock';
      }

      // Weight: If weight is provided, ensure it's a number
      if (bookData.weight) {
        bookData.weight = Number(bookData.weight);
      }
    }

    const newBook = await BookServices.createBook(bookData);

    if (!newBook) {
      throw new CustomError.BadRequestError('Failed to create book!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Book created successfully',
      data: newBook,
    });
  });

  getBooks = asyncHandler(async (req: Request, res: Response) => {
    const {search, category} = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    const skip = (page - 1) * limit;
    const books = await BookServices.getBooks(search as unknown as string, category as unknown as string, skip, limit);

    const totalBooks = await BookServices.countBooks();
    const totalPages = Math.ceil(totalBooks / limit);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Books retrieved successfully',
      meta: {
        totalData: totalBooks,
        totalPage: totalPages,
        currentPage: page,
        limit: limit,
      },
      data: books,
    });
  });

  getBookById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const book = await BookServices.getBookById(id);

    if (!book) {
      throw new CustomError.NotFoundError('Book not found!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Book retrieved successfully',
      data: book,
    });
  });

  updateBook = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const bookData = req.body;
    const files = req.files;

    const book = await BookServices.getBookById(id);

    if (!book) {
      throw new CustomError.NotFoundError('Book not found to update!');
    }

    if (files && files.coverImage) {
      const imagePath = await fileUploader(files as FileArray, `book-cover-image`, 'coverImage');
      bookData.coverImage = imagePath as string;
    }

    if (bookData) {
      // Price: If priceAmount is provided, set price
      if (bookData.priceAmount) {
        bookData.price = {
          amount: Number(bookData.priceAmount),
          currency: CURRENCY_ENUM.USD,
        };
      }

      // Quantity: If quantity is provided, ensure it's a number
      if (bookData.quantity) {
        bookData.quantity = book.quantity + Number(bookData.quantity);
      }

      // Set Arabic language flag
      if (bookData.language === 'arabic') {
        bookData.isArabic = true;
      }

      // Determine stock status based on quantity
      if (bookData.quantity > 0) {
        bookData.status = 'instock';
      } else if (bookData.quantity <= 0) {
        bookData.status = 'outofstock';
      }

      // Weight: If weight is provided, ensure it's a number
      if (bookData.weight) {
        bookData.weight = Number(bookData.weight);
      }
    }

    const updatedBook = await BookServices.updateBook(id, bookData);

    if (!updatedBook) {
      throw new CustomError.BadRequestError('Failed to update book!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Book updated successfully',
    });
  });

  deleteAllBooks = asyncHandler(async (req: Request, res: Response) => {
    const deletedBooks = await BookServices.deleteAllBooks();

    if (!deletedBooks?.deletedCount) {
      throw new CustomError.BadRequestError('Failed to delete books!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'All books deleted successfully',
    });
  });
}

export default new BookController();
