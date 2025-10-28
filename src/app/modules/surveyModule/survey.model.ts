import mongoose from 'mongoose';
import { ISurvey } from './survey.interface';

const surveySchema = new mongoose.Schema<ISurvey>(
  {
    readerName: String,
    email: String,
    relation: {
      type: String,
      enum: {
        values: ['Parent', 'Grandparent', 'Guardian', 'Teacher', 'Friend', 'Other Relative'],
        message: '{VALUE} is not accepted as a relation value. Use Parent/Grandparent/Guardian/Teacher/Friend/Other Relative.',
      },
      required: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not accepted as a gender value. Use Male/Female/Other.',
      },
      required: true,
    },
    dateOfBirth: Date,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    favoriteCollection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bookCollection' }],
    interestInArabic: {
      type: Boolean,
      required: true,
    },
    lavelInArabic: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced'],
        message: '{VALUE} is not accepted as a lavel value. Use Beginner/Intermediate/Advanced.',
      },
      // required: true,
    },
    costSpend: {
      statement: {
        type: String,
        required: true,
      },
      minPrice: Number,
      maxPrice: Number,
      bookRange: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    cardInfo: {
      number: Number,
      expireDate: Date,
      cvv: Number,
    },
  },
  {
    timestamps: true,
  },
);

const Survey = mongoose.model<ISurvey>('survey', surveySchema);
export default Survey;
