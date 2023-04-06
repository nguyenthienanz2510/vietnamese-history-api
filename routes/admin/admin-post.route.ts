import { Router } from 'express'
import helpersMiddleware from '../../middleware/helpers.middleware'
import authMiddleware from '../../middleware/auth.middleware'
import PostController from '../../controllers/post.controller'
import postMiddleware from '../../middleware/post.middleware'
import { wrapAsync } from '../../utils/response'

const adminPostRouter = Router()
/**
 * [Get posts paginate]
 * @queryParam type: string, page: number, limit: number, category:mongoId
 * @route admin/posts
 * @method get
 */
adminPostRouter.get(
  '',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  postMiddleware.getPostsRules(),
  helpersMiddleware.entityValidator,
  wrapAsync(PostController.getPosts)
)
/**
 * [Get all posts ]
 * @queryParam type: string, category:mongoId
 * @route admin/posts/all
 * @method get
 */
adminPostRouter.get(
  '/all',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  postMiddleware.getAllPostsRules(),
  helpersMiddleware.entityValidator,
  wrapAsync(PostController.getAllPosts)
)

adminPostRouter.get(
  '/:post_id',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.idRule('post_id'),
  helpersMiddleware.idValidator,
  wrapAsync(PostController.getPost)
)
adminPostRouter.post(
  '',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyUser,
  postMiddleware.addPostRules(),
  helpersMiddleware.entityValidator,
  wrapAsync(PostController.addPost)
)
adminPostRouter.put(
  '/:post_id',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.idRule('post_id'),
  helpersMiddleware.idValidator,
  postMiddleware.updatePostRules(),
  helpersMiddleware.entityValidator,
  wrapAsync(PostController.updatePost)
)

adminPostRouter.delete(
  '/delete/:post_id',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.idRule('post_id'),
  helpersMiddleware.idValidator,
  wrapAsync(PostController.deletePost)
)

adminPostRouter.delete(
  '/delete-many',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  helpersMiddleware.listIdRule('list_id'),
  helpersMiddleware.idValidator,
  wrapAsync(PostController.deleteManyPosts)
)

adminPostRouter.post(
  '/upload-image',
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyAdmin,
  wrapAsync(PostController.uploadPostThumb)
)
export default adminPostRouter
