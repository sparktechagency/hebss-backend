import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
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

const Grade = mongoose.model('grade', gradeSchema);
export default Grade;
