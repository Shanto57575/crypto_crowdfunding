import Blog from '../models/blog.model.js';

// Create a new blog
const addBlog = async (req, res) => {
    try {
        const { title, content, author, tags } = req.body;

        if (!title || !content || !author || !tags) {
            return res.status(400).json({
                error: 'Title, content, author, and tags are required fields.',
            });
        }

        let tagArray = tags;
        if (typeof tags === 'string') {
            tagArray = tags.split(',').map(tag => tag.trim());
        }

        if (!Array.isArray(tagArray) || tagArray.length === 0) {
            return res.status(400).json({
                error: 'Tags should be a non-empty array or comma-separated string.',
            });
        }

        const blog = await Blog.create({
            ...req.body,
            tags: tagArray
        });

        res.status(201).json({
            message: 'Blog created successfully',
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while creating the blog',
            details: error.message,
        });
    }
};

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();

        if (blogs.length === 0) {
            return res.status(404).json({
                message: 'No blogs found',
            });
        }

        res.status(200).json({
            message: 'Blogs retrieved successfully',
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while fetching blogs',
            details: error.message,
        });
    }
};

// Get a single blog by ID
const singleBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid blog ID',
            });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                error: 'Blog not found',
            });
        }

        res.status(200).json({
            message: 'Blog retrieved successfully',
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while fetching the blog',
            details: error.message,
        });
    }
};

// Update a blog by ID
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid blog ID',
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedBlog) {
            return res.status(404).json({
                error: 'Blog not found',
            });
        }

        res.status(200).json({
            message: 'Blog updated successfully',
            data: updatedBlog,
        });
    } catch (error) {
        res.status(400).json({
            error: 'An error occurred while updating the blog',
            details: error.message,
        });
    }
};

// Delete a blog by ID
const removeBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid blog ID',
            });
        }

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({
                error: 'Blog not found',
            });
        }

        res.status(200).json({
            message: 'Blog deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while deleting the blog',
            details: error.message,
        });
    }
};

export {
    addBlog,
    getAllBlogs,
    singleBlog,
    updateBlog,
    removeBlog,
};
