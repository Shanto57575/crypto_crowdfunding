import express from 'express';
import {
    addComment,
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    removeComment,
    updatePost
} from '../controllers/post.controller.js';
import upload from '../utils/multerConfig.js';

const postRouter = express.Router();

postRouter.post("/add-post", upload.array("images", 6), createPost);
postRouter.post('/add-comment', addComment);
postRouter.get('/all-posts', getAllPosts);
postRouter.get('/:id', getPostById);
postRouter.put('/:id', upload.array("images", 6), updatePost);
postRouter.delete('/remove-post', deletePost);
postRouter.delete('/remove-comment', removeComment);

export default postRouter;
