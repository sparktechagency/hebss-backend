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

  async updateBox(id: string, boxData: IBox) {
    return await Box.findByIdAndUpdate(id, boxData, { new: true });
  }
}

export default new BoxService();
