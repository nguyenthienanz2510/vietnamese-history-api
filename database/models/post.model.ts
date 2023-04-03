import mongoose, { Schema } from 'mongoose'

const PostSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 255 },
    thumb: { type: String },
    description: { type: String },
    content: { type: String },
    categories: [{ type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'categories' }],
    author: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'users' },
    rating: { type: Number, default: 0 },
    comments: [{ type: String }],
  },
  {
    timestamps: true,
  }
)
export const PostModel = mongoose.model('posts', PostSchema)
