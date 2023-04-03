import { Router } from 'express'
import PostController from '../../controllers/post.controller'
import postMiddleware from '../../middleware/post.middleware'
import helpersMiddleware from '../../middleware/helpers.middleware'
import { wrapAsync } from '../../utils/response'

const commonPostRouter = Router()
/**
 * [Get posts paginate]
 * @queryParam type: string, page: number, limit: number, category:mongoId, exclude: mongoId post
 * @route posts
 * @method get
 */
commonPostRouter.get(
  '',
  postMiddleware.getPostsRules(),
  helpersMiddleware.entityValidator,
  wrapAsync(PostController.getPosts)
)

commonPostRouter.get(
  '/:post_id',
  helpersMiddleware.idRule('post_id'),
  helpersMiddleware.idValidator,
  wrapAsync(PostController.getPost)
)

commonPostRouter.get(
  '/search',
  wrapAsync(PostController.searchPost)
)
export default commonPostRouter
