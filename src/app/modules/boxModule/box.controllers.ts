import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import BoxServices from './box-services';
import categoryServices from '../categoryModule/category.services';
import Book from '../bookModule/book.model';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import mongoose from 'mongoose';
import { IBook } from '../bookModule/book.interface';

class BoxController {
  createBox = asyncHandler(async (req: Request, res: Response) => {
    const boxData = req.body;
    const files = req.files;

    const boxes = await BoxServices.getBoxes();
    if(boxes.length >= 4){
      throw new CustomError.BadRequestError('Only 4 boxes are allowed!');
    }

    const category = await categoryServices.getCategoryById(boxData.category);
    if (!category) {
      boxData.type = 'gift',
      boxData.title = 'Gift Box'
    }else{
      boxData.title = category.title;
    }


    if (boxData.books && boxData.books.length > 0) {
      boxData.piece = boxData.books.length;
      boxData.price.amount = boxData.books.reduce((acc: number, book: any) => acc + book.price.amount, 0);
    }

    if (files && files.image) {
      const imagePath = await fileUploader(files as FileArray, `box-image`, 'image');
      boxData.image = imagePath as string;
    }

    const newBox = await BoxServices.createBox(boxData);

    if (!newBox) {
      throw new CustomError.BadRequestError('Failed to create box!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Box created successfully',
      data: newBox,
    });
  });

  getBoxes = asyncHandler(async (req: Request, res: Response) => {
    const boxes = await BoxServices.getBoxes();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Boxes retrieved successfully',
      data: boxes,
    });
  });

  getBoxById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const box = await BoxServices.getBoxById(id);
    if (!box) {
      throw new CustomError.NotFoundError('Box not found!');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Box retrieved successfully',
      data: box,
    });
  });

  customizeBookInBox = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const boxData = req.body;

    // Get the existing box
    const box = await BoxServices.getBoxById(id);
    if (!box) {
      throw new CustomError.NotFoundError('Box not found!');
    }

    // Initialize the updated price and piece count
    let updatedPieceCount = box.piece || 0;
    let updatedPrice = box.price.amount || 0;

    // Handle removed books if provided
    if (boxData.removedBooks && boxData.removedBooks.length > 0) {
      // check if the book is already in the box
      const isBookInBox = box.books.some((book: any) => book._id.toString() === boxData.removedBooks[0]);
      if (!isBookInBox) {
        throw new CustomError.BadRequestError('Book not found in the box!');
      }

      // Ensure the removed book IDs are valid ObjectIds
      const validRemovedBooks = boxData.removedBooks.filter((bookId: string) => mongoose.Types.ObjectId.isValid(bookId));

      if (validRemovedBooks.length === 0) {
        throw new CustomError.BadRequestError('No valid book IDs found in removedBooks.');
      }

      // Fetch the books to be removed
      const removedBooks = await Book.find({ _id: { $in: validRemovedBooks } });

      // Remove books and adjust the piece count and price
      removedBooks.forEach((book) => {
        updatedPieceCount -= 1;
        updatedPrice -= book.price.amount;
      });

      // Filter the box.books array to remove the removed books
      box.books = box.books.filter((book: any) => !validRemovedBooks.includes(book._id.toString()));
    }

    // Handle added books if provided
    if (boxData.addedBooks && boxData.addedBooks.length > 0) {
      // Ensure the added book IDs are valid ObjectIds
      const validAddedBooks = boxData.addedBooks.filter((bookId: string) => mongoose.Types.ObjectId.isValid(bookId));

      if (validAddedBooks.length === 0) {
        throw new CustomError.BadRequestError('No valid book IDs found in addedBooks.');
      }

      // Fetch the books to be added
      const addedBooks = await Book.find({ _id: { $in: validAddedBooks } });

      // Filter out books that are already in the box.books array to avoid duplicates
      const newBooksToAdd = addedBooks.filter(
        (book: any) => !box.books.some((existingBook: any) => existingBook.toString() === book._id.toString()),
      );

      // Add books that are not already in the box
      newBooksToAdd.forEach((book: any) => {
        updatedPieceCount += 1;
        updatedPrice += book.price.amount;
      });

      // Add the new books to the box.books array
      box.books = [...box.books, ...newBooksToAdd.map((book: any) => book._id)];
    }

    // Update the box's piece and price
    box.piece = updatedPieceCount;
    box.price.amount = updatedPrice;

    // Save the updated box to the database
    const updatedBox = await box.save();

    if (!updatedBox) {
      throw new CustomError.BadRequestError('Failed to update box!');
    }

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Box customized successfully',
    });
  });
}

export default new BoxController();
