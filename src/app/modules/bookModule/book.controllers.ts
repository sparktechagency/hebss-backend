import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import BookServices from './book.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import { CURRENCY_ENUM } from '../../../enums/currency';
import subscribeServices from '../subscriberModule/subscribe.services';
import config from '../../../config';
import sendMail from '../../../utils/sendEmail';

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

      // Discount Price: If discountPriceAmount is provided, set discount price
      const isDiscount = bookData.isDiscount === 'true';
      if (isDiscount) {
        if (bookData.discountAmount) {
          bookData.discountPrice = {
            type: bookData.discountType,
            amount: Number(bookData.discountAmount),
            currency: CURRENCY_ENUM.USD,
          };
        } else {
          throw new CustomError.BadRequestError('Discount type and discount amount is required while isDiscount is true');
        }
      }

      // Quantity: If quantity is provided, ensure it's a number
      if (bookData.quantity) {
        bookData.quantity = Number(bookData.quantity);
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

    // send email to subscriber email
    const subscribers = await subscribeServices.getSubscribers();

    subscribers.map((subscriber) => {
      const content = `New book is added! Check it out! 
            
            Book Link: ${config.frontend_url}/bookStore/${newBook._id}
            `;
      // const verificationLink = `${server_base_url}/v1/auth/verify-email/${user._id}?userCode=${userData.verification.code}`
      // const content = `Click the following link to verify your email: ${verificationLink}`
      const mailOptions = {
        from: config.gmail_app_user as string,
        to: subscriber.email,
        subject: 'New Book Added',
        text: content,
      };

      sendMail(mailOptions);
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Book created successfully',
      data: newBook,
    });
  });

  getBooks = asyncHandler(async (req: Request, res: Response) => {
    const { search, category, collection, grade, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    const order = sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = (page - 1) * limit;
    const books = await BookServices.getBooks(
      search as unknown as string,
      category as unknown as string,
      collection as unknown as string,
      grade as unknown as string,
      skip,
      limit,
      sortBy as unknown as string,
      order,
    );

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

      // Discount Price: If discountPriceAmount is provided, set discount price
      if (bookData.isDiscount) {
        if (bookData.discountAmount) {
          bookData.discountPrice = {
            type: bookData.discountType,
            amount: Number(bookData.discountAmount),
            currency: CURRENCY_ENUM.USD,
          };
        } else {
          throw new CustomError.BadRequestError('Discount type and discount amount is required while isDiscount is true');
        }
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

  deleteBook = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedBook = await BookServices.deleteBook(id);

    if (!deletedBook) {
      throw new CustomError.BadRequestError('Failed to delete book!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Book deleted successfully',
    });
  });
}

export default new BookController();
