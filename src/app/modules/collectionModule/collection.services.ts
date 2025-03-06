import { ICollection } from './collection.interface';
import Collection from './collection.model';

class CollectionService {
  async createCollection(collectionData: ICollection) {
    const collection = new Collection(collectionData);
    return await collection.save();
  }

  async getCollections() {
    return await Collection.find();
  }

  async getCollectionById(id: string) {
    return await Collection.findById(id);
  }

  async updateCollection(id: string, collectionData: ICollection) {
    return await Collection.findByIdAndUpdate(id, collectionData, { new: true });
  }

  async deleteAllCollections() {
    return await Collection.deleteMany({});
  }
}

export default new CollectionService();
