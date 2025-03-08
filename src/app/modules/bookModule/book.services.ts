import { IBook } from './book.interface';
import Book from './book.model';

class BookService {
  async createBook(bookData: IBook) {
    const book = new Book(bookData);
    return await book.save();
  }

  async getBooks(searchTerm: string, category: string, skip: number, limit: number) {
    let query: any = {};
    if (category) {
      query.category = category;
    }
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    return await Book.find(query).skip(skip).limit(limit).populate([
        {
            path: 'category',
            select: 'title ageGroup'
        },
        {
            path: 'grade',
            select: 'title'
        },
        {
            path: 'bookCollection',
            select: 'title'
        }
    ]);
  }

  async getBookById(id: string) {
    return await Book.findById(id);
  }

  async updateBook(id: string, bookData: IBook) {
    return await Book.findByIdAndUpdate(id, bookData, { new: true });
  }

  async deleteAllBooks() {
    return await Book.deleteMany({});
  }

  async countBooks() {
    return await Book.countDocuments();
  }
}

export default new BookService();
