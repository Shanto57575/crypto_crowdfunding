import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
    },
    tags: {
      type: [String],
      default: [],
      required: [true, "Tags are required"],
    },
    image: {
      type: String,
      required: true,
    },
    userAddress: {
      type: mongoose.Schema.Types.ObjectId, // This sets the field to reference another document
      ref: 'User', // The name of the referenced model
      required: [true, 'User address is required'],
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
