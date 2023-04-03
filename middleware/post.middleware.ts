import { body, query } from 'express-validator'
import { isMongoId } from '../utils/validate'

const getPostsRules = () => {
  return [
    query('page')
      .if((value) => value !== undefined)
      .isInt()
      .withMessage('page không đúng định dạng'),
    query('limit')
      .if((value) => value !== undefined)
      .isInt()
      .withMessage('limit không đúng định dạng'),
    query('category')
      .if((value: any) => value !== undefined)
      .isMongoId()
      .withMessage('category không đúng định dạng'),
    query('exclude')
      .if((value: any) => value !== undefined)
      .isMongoId()
      .withMessage('exclude không đúng định dạng'),
  ]
}

const getAllPostsRules = () => {
  return [
    query('category')
      .if((value: any) => value !== undefined)
      .isMongoId()
      .withMessage('category không đúng định dạng'),
  ]
}

const getPagesRules = () => {
  return [
    query('limit').isInt().withMessage('limit không đúng định dạng'),
    query('category')
      .if((value: any) => value !== undefined)
      .isMongoId()
      .withMessage('category không đúng định dạng'),
  ]
}

const addPostRules = () => {
  return [
    body('title')
      .exists({ checkFalsy: true })
      .withMessage('Tiêu đề không được để trống')
      .isLength({ max: 255 })
      .withMessage('Tiêu đề  phải ít hơn 255 kí tự'),
    body('categories')
      .exists({ checkFalsy: true })
      .withMessage('category không được để trống')
      .isMongoId()
      .withMessage(`category phải là id`),
    body('author')
      .exists({ checkFalsy: true })
      .withMessage('author không được để trống')
      .isMongoId()
      .withMessage(`author phải là id`),
    body('rating')
      .if((value: any) => value !== undefined)
      .isNumeric()
      .withMessage('rating phải ở định dạng number')
  ]
}

const updatePostRules = () => {
  return addPostRules()
}

const PostMiddleware = {
  addPostRules,
  updatePostRules,
  getPostsRules,
  getPagesRules,
  getAllPostsRules,
}

export default PostMiddleware
