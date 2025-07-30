import { IBox } from './box-interface';
import Box from './box.model';

class BoxService {
  async createBox(boxData: IBox) {
    const box = new Box(boxData);
    return await box.save();
  }

  async getBoxes() {
    return await Box.find();
  }

  async getBoxById(id: string) {
    return await Box.findById(id);
  }

  async getBoxesByCategoryId(categoryId: string) {
    return await Box.find({ category: categoryId });
  }

  async getBoxByUserId(userId: string) {
    return await Box.findOne({ user: userId });
  }

  async getSpecificBoxByCategoryId(categoryId: string) {
    return await Box.findOne({ category: categoryId }).populate([
      {
        path: 'category',
        select: ''
      },
      {
        path: 'books',
        select: ''
      }
    ])
  }

  async updateBox(id: string, boxData: IBox) {
    return await Box.findByIdAndUpdate(id, boxData, { new: true });
  }
}

export default new BoxService();
