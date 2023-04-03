import mongoose, { Schema } from 'mongoose'

const CategorySchema = new Schema({
  name: { type: String, maxlength: 255 },
  subcategories: [{name: { type: String, maxlength: 255 }}]
})

export const CategoryModel = mongoose.model('categories', CategorySchema)
