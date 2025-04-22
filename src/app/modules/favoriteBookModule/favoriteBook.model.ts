import mongoose from "mongoose";

const faboriteBookSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', unique: true, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
}, {
    timestamps: true
});

const FavoriteBook = mongoose.model('favoriteBook', faboriteBookSchema);

export default FavoriteBook;