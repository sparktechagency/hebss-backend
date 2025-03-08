import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Collection = mongoose.model('bookCollection', collectionSchema);
export default Collection;
