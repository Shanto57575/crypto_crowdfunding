import express from 'express';
import {
    addBlog,
    getAllBlogs,
    removeBlog,
    singleBlog,
    updateBlog
} from '../controllers/blog.controller.js';

const blogRouter = express.Router();

blogRouter.post('/add-blog', addBlog);
blogRouter.get('/all-blogs', getAllBlogs);
blogRouter.get('/:id', singleBlog);
blogRouter.put('/:id', updateBlog);
blogRouter.delete('/remove-blog', removeBlog);

export default blogRouter;
