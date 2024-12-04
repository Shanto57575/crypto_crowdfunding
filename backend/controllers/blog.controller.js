import Blog from '../models/blog.model.js';
import mongoose from 'mongoose';
import blogUpload from '../utils/multerConfig.js';

// Create a new blog
export const addBlog = async (req, res) => {
    console.log("=== START: addBlog function ===");
    
    try {
        // Use blog-specific multer upload middleware for single image
        blogUpload.single('image')(req, res, async function(err) {
            if (err) {
                console.error("Multer error:", err);
                return res.status(400).json({
                    error: err.message || 'Error uploading file'
                });
            }

            console.log("File received:", req.file);
            console.log("Body received:", req.body);

            const { title, content, author, tags, userAddress } = req.body;

            // Validate required fields
            if (!title || !content || !author || !tags || !userAddress || !req.file) {
                console.log("Missing required fields");
                return res.status(400).json({
                    error: 'All fields including image are required'
                });
            }

            // Process tags
            let tagArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;

            // Create image path
            const imagePath = `/uploads/blogs/${req.file.filename}`;
            console.log("Image path:", imagePath);

            // Create blog post
            const blog = await Blog.create({
                title,
                content,
                author,
                tags: tagArray,
                image: imagePath,
                userAddress
            });

            console.log("Blog created successfully:", blog);
            console.log("=== END: addBlog function (Success) ===");

            res.status(201).json({
                message: 'Blog created successfully',
                data: blog
            });
        });
    } catch (error) {
        console.error("Error in addBlog:", error);
        console.log("=== END: addBlog function (Error) ===");
        res.status(500).json({
            error: 'An error occurred while creating the blog',
            details: error.message
        });
    }
};

// Get all blogs
export const getAllBlogs = async (req, res) => {
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
export const singleBlog = async (req, res) => {
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
export const updateBlog = async (req, res) => {
    console.log("Update request - Full Details:", {
        id: req.params.id,
        body: req.body,
        files: req.files
    });

    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid blog ID',
            });
        }

        // Find existing blog
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Prepare update object
        const updateData = { ...req.body };

        // Handle image updates
        let updatedImages = existingBlog.images || []; // Existing images

        // Add new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map((file) => `/uploads/blogs/${file.filename}`);
            updatedImages = [...updatedImages, ...newImagePaths];
        }

        // Handle images to remove if provided
        if (req.body.removeImages) {
            const imagesToRemove = Array.isArray(req.body.removeImages)
                ? req.body.removeImages
                : [req.body.removeImages];
            updatedImages = updatedImages.filter((img) => !imagesToRemove.includes(img));
        }

        // Enforce the limit of 6 images (you can adjust this limit as needed)
        if (updatedImages.length > 6) {
            return res.status(400).json({ error: "Cannot have more than 6 images." });
        }

        // Update images in the database
        updateData.images = updatedImages;

        // Handle tags update
        if (updateData.tags) {
            if (typeof updateData.tags === 'string') {
                updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
            }
            if (!Array.isArray(updateData.tags) || updateData.tags.length === 0) {
                return res.status(400).json({
                    error: 'Tags should be a non-empty array or comma-separated string.',
                });
            }
        }

        console.log("Prepared Update Data:", updateData);

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
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
export const removeBlog = async (req, res) => {
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

