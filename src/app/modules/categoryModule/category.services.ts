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

  async getCategoryByAge(age: number) {
    const categories = await Category.find();
  
    for (const category of categories) {
      const match = category.ageGroup.match(/(\d+)\s*-\s*(\d+)/);
      if (match) {
        const minAge = parseInt(match[1], 10);
        const maxAge = parseInt(match[2], 10);
  
        if (age >= minAge && age <= maxAge) {
          return category;
        }
      }
    }
  
    return null;
  }
}

export default new CategoryService();
