import mongoose from 'mongoose';
export interface Verse extends mongoose.Document {
  id: string;
  ESV: string;
  KJV: string;
  NASB: string;
}

export interface Books extends mongoose.Document {
  id: string;
  verses: Verse[];
}

const VerseSchema = new mongoose.Schema<Verse>({
  id: {
    type: String,
    required: [true, 'Verse ID is required'],
  },
  ESV: {
    type: String,
    required: [true, 'ESV translation is required'],
  },
  KJV: {
    type: String,
    required: [true, 'KJV translation is required'],
  },
  NASB: {
    type: String,
    required: [true, 'NASB translation is required'],
  },
});

const BookSchema = new mongoose.Schema<Books>({
  id: {
    type: String,
    required: [
      true,
      'Please provide the book name followed by chapter number, such as [Book name]_[Chapter number]',
    ],
  },
  verses: {
    type: [VerseSchema],
    required: [true, 'Verses array is required'],
  },
});
export default BookSchema;
