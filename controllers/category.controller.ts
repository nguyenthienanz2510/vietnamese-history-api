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
  const condition: any = {}
  const select: any = { __v: 0 }
  let categories
  if (exclude) {
    condition._id = { $ne: exclude }
  }
  let response = {
    message: 'Get categories successfully',
    data: {},
  }

  if (!lang) {
    categories = await CategoryModel.find(condition)
      .populate('parent')
      .select(select)
      .lean()
  } else if (lang === LANG.DEFAULT) {
    categories = await CategoryModel.find(condition)
      .populate('parent')
      .select({ ...select, translations: 0 })
      .lean()
  } else {
    categories = await CategoryModel.find(condition)
      .populate('parent')
      .select(select)
      .lean()
    categories.forEach((category: any) => {
      const translation = category.translations[String(lang)]
      category.name = translation?.name || ''
      category.description = translation?.description || ''
      delete category.translations
    })
  }
  response.data = categories
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
