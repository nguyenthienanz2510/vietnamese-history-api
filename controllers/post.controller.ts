import { Request, Response } from 'express'
import { responseSuccess, ErrorHandler } from '../utils/response'
import { PostModel } from '../database/models/post.model'
import { STATUS } from '../constants/status'
import { LANG } from '../constants/config'
import mongoose from 'mongoose'
import { isAdmin } from '../utils/validate'
import { uploadFile } from '../utils/upload'
import { HOST } from '../utils/helper'
import { FOLDERS, FOLDER_UPLOAD, ROUTE_IMAGE } from '../constants/config'
import fs from 'fs'
import { omitBy } from 'lodash'
import { ORDER, SORT_BY } from '../constants/post'

export const handleThumbPost = (post) => {
  if (post.thumb !== undefined && post.thumb !== '') {
    post.thumb = HOST + `/${ROUTE_IMAGE}/` + post.thumb
  }
  return post
}

const removeThumbPost = (thumb) => {
  if (thumb !== undefined && thumb !== '') {
    fs.unlink(`${FOLDER_UPLOAD}/${FOLDERS.POST}/${thumb}`, (err) => {
      if (err) console.error(err)
    })
  }
}

const addPost = async (req: Request, res: Response) => {
  const form: Post = req.body
  const {
    title,
    thumb,
    description,
    content,
    categories,
    author,
    likes,
    order,
    comments,
    translations,
  } = form
  const post = {
    title,
    thumb,
    description,
    content,
    categories,
    author,
    likes,
    order,
    comments,
    translations,
  }
  const postAdd = await new PostModel(post).save()
  const response = {
    message: 'Create post successfully',
    data: postAdd.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        return handleThumbPost(ret)
      },
    }),
  }
  return responseSuccess(res, response)
}

const getPosts = async (req: Request, res: Response) => {
  let {
    page = 1,
    limit = 30,
    lang,
    category,
    exclude,
    sort_by,
    order,
    title,
  } = req.query as {
    [key: string]: string | number
  }

  page = Number(page)
  limit = Number(limit)
  let condition: any = {}
  let select: any = { __v: 0 }
  if (category) {
    condition.category = category
  }
  if (exclude) {
    condition._id = { $ne: exclude }
  }
  if (!ORDER.includes(order as string)) {
    order = ORDER[0]
  }
  if (!SORT_BY.includes(sort_by as string)) {
    sort_by = SORT_BY[0]
  }
  if (title) {
    condition.title = {
      $regex: title,
      $options: 'i',
    }
  }

  if ( lang && lang === LANG.DEFAULT) {
    select = { ...select, translations: 0 }
  } else if (lang && lang !== LANG.DEFAULT) {
    let [posts, totalPosts]: [posts: any, totalPosts: any] = await Promise.all([
      PostModel.find(condition)
        .populate({
          path: 'category',
        })
        .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
        .skip(page * limit - limit)
        .limit(limit)
        .select(select)
        .lean(),
      PostModel.find(condition).countDocuments().lean(),
    ])
    posts.forEach((post: any) => {
      const translation = post.translations[String(lang)]
      post.title = translation?.title || ''
      post.description = translation?.description || ''
      post.content = translation?.content || ''
      delete post.translations
    })
    // posts = posts.map((post) => handleThumbPost(post))
    const page_size = Math.ceil(totalPosts / limit) || 1
    const response = {
      message: 'Get posts successfully',
      data: {
        posts,
        pagination: {
          page,
          limit,
          page_size,
        },
      },
    }
    return responseSuccess(res, response)
  }

  let [posts, totalPosts]: [posts: any, totalPosts: any] = await Promise.all([
    PostModel.find(condition)
      .populate({
        path: 'category',
      })
      .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
      .skip(page * limit - limit)
      .limit(limit)
      .select(select)
      .lean(),
    PostModel.find(condition).countDocuments().lean(),
  ])
  // posts = posts.map((post) => handleThumbPost(post))
  const page_size = Math.ceil(totalPosts / limit) || 1
  const response = {
    message: 'Get posts successfully',
    data: {
      posts,
      pagination: {
        page,
        limit,
        page_size,
      },
    },
  }
  return responseSuccess(res, response)
}

const getAllPosts = async (req: Request, res: Response) => {
  let { category } = req.query
  let condition = {}
  if (category) {
    condition = { category: category }
  }
  let posts: any = await PostModel.find(condition)
    .populate({ path: 'category' })
    .sort({ createdAt: -1 })
    .select({ __v: 0, description: 0 })
    .lean()
  posts = posts.map((post) => handleThumbPost(post))
  const response = {
    message: 'Get all posts successfully',
    data: posts,
  }
  return responseSuccess(res, response)
}

const getPost = async (req: Request, res: Response) => {
  let condition = { _id: req.params.post_id }
  const postDB: any = await PostModel.findOneAndUpdate(
    condition,
    { $inc: { view: 1 } },
    { new: true }
  )
    .populate('category')
    .select({ __v: 0 })
    .lean()
  if (postDB) {
    const response = {
      message: 'Lấy sản phẩm thành công',
      data: handleThumbPost(postDB),
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
  }
}

const updatePost = async (req: Request, res: Response) => {
  const form: Post = req.body
  const {
    title,
    thumb,
    description,
    content,
    categories,
    author,
    likes,
    order,
    comments,
  } = form
  const post = omitBy(
    {
      title,
      thumb,
      description,
      content,
      categories,
      author,
      likes,
      order,
      comments,
    },
    (value) => value === undefined || value === ''
  )
  const postDB = await PostModel.findByIdAndUpdate(req.params.post_id, post, {
    new: true,
  })
    .select({ __v: 0 })
    .lean()
  if (postDB) {
    const response = {
      message: 'Cập nhật sản phẩm thành công',
      data: handleThumbPost(postDB),
    }
    return responseSuccess(res, response)
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
  }
}

const deletePost = async (req: Request, res: Response) => {
  const post_id = req.params.post_id
  const postDB: any = await PostModel.findByIdAndDelete(post_id).lean()
  if (postDB) {
    removeThumbPost(postDB.image)
    return responseSuccess(res, { message: 'Xóa thành công' })
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
  }
}

const deleteManyPosts = async (req: Request, res: Response) => {
  const list_id = (req.body.list_id as string[]).map((id: string) =>
    mongoose.Types.ObjectId(id)
  )
  const postDB: any = await PostModel.find({
    _id: { $in: list_id },
  }).lean()
  const deletedData = await PostModel.deleteMany({
    _id: { $in: list_id },
  }).lean()
  postDB.forEach((post) => {
    removeThumbPost(post.image)
  })
  if (postDB.length > 0) {
    return responseSuccess(res, {
      message: `Xóa ${deletedData.deletedCount} sản phẩm thành công`,
      data: { deleted_count: deletedData.deletedCount },
    })
  } else {
    throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm')
  }
}

const searchPost = async (req: Request, res: Response) => {
  let { searchText }: { [key: string]: string | any } = req.query
  searchText = decodeURI(searchText)
  let condition = { $text: { $search: `\"${searchText}\"` } }
  if (!isAdmin(req)) {
    condition = Object.assign(condition, { visible: true })
  }
  let posts: any = await PostModel.find(condition)
    .populate('category')
    .sort({ createdAt: -1 })
    .select({ __v: 0, description: 0 })
    .lean()
  posts = posts.map((post) => handleThumbPost(post))
  const response = {
    message: 'Tìm các sản phẩm thành công',
    data: posts,
  }
  return responseSuccess(res, response)
}

const uploadPostThumb = async (req: Request, res: Response) => {
  const path = await uploadFile(req, FOLDERS.POST)
  const response = {
    message: 'Upload ảnh thành công',
    data: path,
  }
  return responseSuccess(res, response)
}

const PostController = {
  addPost,
  getAllPosts,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  searchPost,
  deleteManyPosts,
  uploadPostThumb,
}

export default PostController
