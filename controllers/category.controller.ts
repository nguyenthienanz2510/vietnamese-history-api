import { Request, Response } from 'express'
import { responseSuccess, ErrorHandler } from '../utils/response'
import { STATUS } from '../constants/status'
import { LANG } from '../constants/config'
import { CategoryModel } from '../database/models/category.model'
import { omitBy } from 'lodash'

const addCategory = async (req: Request, res: Response) => {
  const form: Category = req.body
  const { name, description, image, parent, order, translations } = form
  const category = {
    name,
    description,
    image,
    parent,
    order,
    translations,
  }
  const categoryAdd = await new CategoryModel(category).save()
  const response = {
    message: 'Create category successfully',
    data: categoryAdd.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        // return handleThumbPost(ret)
      },
    }),
  }
  return responseSuccess(res, response)
}

// const getCategories = async (req: Request, res: Response) => {
//   const { exclude } = req.query
//   let condition = exclude ? { _id: { $ne: exclude } } : {}
//   const categories = await CategoryModel.find(condition)
//     .select({ __v: 0 })
//     .lean()
//   const response = {
//     message: 'Get categories successfully',
//     data: categories,
//   }
//   return responseSuccess(res, response)
// }

const getCategories = async (req: Request, res: Response) => {
  const { lang, exclude } = req.query
  let condition: any = {}
  let select: any = { __v: 0 }
  if (exclude) {
    condition._id = { $ne: exclude }
  }
  let response = {
    message: 'Get categories successfully',
    data: {},
  }

  if (!lang) {
    const categories = await CategoryModel.find(condition)
      .populate('parent')
      .select({ __v: 0 })
      .lean()
    response.data = categories
  } else if (lang === LANG.DEFAULT) {
    const categories = await CategoryModel.find(condition)
      .populate('parent')
      .select({ __v: 0, translations: 0 })
      .lean()
    response.data = categories
  } else {
    const categories = await CategoryModel.find(condition)
      .populate('parent')
      .select({ __v: 0 })
      .lean()
    categories.forEach((category: any) => {
      category.name =
        (category.translations &&
          category.translations[String(lang)] &&
          category.translations[String(lang)].name) ||
        ''
      category.description =
        (category.translations &&
          category.translations[String(lang)] &&
          category.translations[String(lang)].description) ||
        ''
      delete category.translations
    })
    response.data = categories
  }
  return responseSuccess(res, response)
}

const getCategory = async (req: Request, res: Response) => {
  const categoryDB = await CategoryModel.findById(req.params.category_id)
    .select({ __v: 0 })
    .lean()
  if (categoryDB) {
    const response = {
      message: 'Get category successfully',
      data: categoryDB,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Category not found')
  }
}

const updateCategory = async (req: Request, res: Response) => {
  const form: Category = req.body
  const { name, description, image, parent, order, translations } = form
  const category = omitBy(
    {
      name,
      description,
      image,
      parent,
      order,
      translations,
    },
    (value) => value === undefined || value === ''
  )
  const categoryDB = await CategoryModel.findByIdAndUpdate(
    req.params.category_id,
    category,
    {
      new: true,
    }
  )
    .select({ __v: 0 })
    .lean()
  if (categoryDB) {
    const response = {
      message: 'Update category successfully',
      data: categoryDB,
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Category not found')
  }
}

const deleteCategory = async (req: Request, res: Response) => {
  const category_id = req.params.category_id
  const categoryDB = await CategoryModel.findByIdAndDelete(category_id).lean()
  if (categoryDB) {
    return responseSuccess(res, { message: 'Delete category successfully' })
  } else {
    throw new ErrorHandler(STATUS.BAD_REQUEST, 'Category not found')
  }
}

const categoryController = {
  addCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
}

export default categoryController
