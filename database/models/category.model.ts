import mongoose, { Schema } from 'mongoose'

const CategorySchema = new Schema({
  name: { type: String, maxlength: 255 },
  description: { type: String, maxlength: 1000 },
  image: { type: String, maxlength: 255 },
  parent: { type: mongoose.SchemaTypes.ObjectId, ref: 'categories' },
  order: { type: Number, maxlength: 10 },
  translations: {
    vi: {
      name: { type: String, maxlength: 255 },
      description: { type: String, maxlength: 1000 },
    }
  }
})

export const CategoryModel = mongoose.model('categories', CategorySchema)
