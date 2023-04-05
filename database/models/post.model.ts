import mongoose, { Schema } from 'mongoose'

const PostSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 255 },
    description: { type: String },
    content: { type: String },
    thumb: { type: String },
    categories: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'categories',
      },
    ],
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'users',
    },
    likes: { type: Number, default: 0 },
    order: { type: Number, maxlength: 10 },
    comments: [{ type: String }],
    translations: {
      vi: {
        title: { type: String, required: true, maxlength: 255 },
        description: { type: String },
        content: { type: String },
      },
    },
  },
  {
    timestamps: true,
  }
)
export const PostModel = mongoose.model('posts', PostSchema)
