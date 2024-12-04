import express from 'express';
import {
    addBlog,
    getAllBlogs,
    removeBlog,
    singleBlog,
    updateBlog
} from '../controllers/blog.controller.js';
import upload from '../utils/multerConfig.js';

const blogRouter = express.Router();

blogRouter.post('/add-blog', upload.array('image', 1), addBlog);
blogRouter.get('/all-blogs', getAllBlogs);
blogRouter.get('/:id', singleBlog);
blogRouter.put('/:id', updateBlog);
blogRouter.delete('/remove-blog', removeBlog);

export default blogRouter;
