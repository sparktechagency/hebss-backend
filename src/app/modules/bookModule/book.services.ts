import { IBook } from './book.interface';
import Book from './book.model';

class BookService {
  async createBook(bookData: IBook) {
    const book = new Book(bookData);
    return await book.save();
  }

  // async getBooks(searchTerm: string, category: string, collection: string, grade: string, skip: number, limit: number, sortBy: string, sortOrder: string) {
  //   let query: any = {};
  //   if (category) {
  //     query.category = category;
  //   }
  //   if (collection) {
  //     query.bookCollection = collection;
  //   }
  //   if (grade) {
  //     query.grade = grade;
  //   }
  //   if (searchTerm) {
  //     query.$text = { $search: searchTerm };
  //   }

  //   const sortOptions: any = {};
  //   if(sortBy){
  //     if(sortBy === 'name'){
  //       sortOptions.name = sortOrder === 'asc' ? 1 : -1;
  //     }else if(sortBy === 'price'){
  //       sortOptions['price.amount'] = sortOrder === 'asc' ? 1 : -1;
  //     }
  //   }

  //   return await Book.find(query).skip(skip).limit(limit).sort(sortOptions).populate([
  //       {
  //           path: 'category',
  //           select: 'title ageGroup'
  //       },
  //       {
  //           path: 'grade',
  //           select: 'title'
  //       },
  //       {
  //           path: 'bookCollection',
  //           select: 'title'
  //       }
  //   ]);
  // }
  async getBooks(
    searchTerm: string,
    category: string,
    collection: string,
    grade: string,
    skip: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) {
    let query: any = {};

    if (category) {
      query.category = category;
    }
    if (collection) {
      query.bookCollection = collection;
    }
    if (grade) {
      query.grade = grade;
    }

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' }; // case-insensitive partial match on `name`
    }

    const sortOptions: any = {};
    if (sortBy) {
      if (sortBy === 'name') {
        sortOptions.name = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'price') {
        sortOptions['price.amount'] = sortOrder === 'asc' ? 1 : -1;
      }
    }

    return await Book.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .populate([
        { path: 'category', select: 'title ageGroup' },
        { path: 'grade', select: 'title' },
        { path: 'bookCollection', select: 'title' },
      ]);
  }

  async getBookById(id: string) {
    return await Book.findById(id);
  }

  async updateBook(id: string, bookData: IBook) {
    return await Book.findByIdAndUpdate(id, bookData, { new: true });
  }

  async deleteBook(id: string) {
    return await Book.findByIdAndDelete(id);
  }

  async countBooks() {
    return await Book.countDocuments();
  }
}

export default new BookService();
