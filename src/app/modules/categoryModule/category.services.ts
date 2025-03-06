import { ICategory } from './category.interface';
import Category from './category.model';

class CategoryService {
  async createCategory(categoryData: ICategory) {
    const category = new Category(categoryData);
    return await category.save();
  }

  async getCategories() {
    return await Category.find();
  }

  async getCategoryById(id: string) {
    return await Category.findById(id);
  }

  async updateCategory(id: string, categoryData: ICategory) {
    return await Category.findByIdAndUpdate(id, categoryData, { new: true });
  }

  async deleteAllCategory() {
    return await Category.deleteMany({});
  }
}

export default new CategoryService();
