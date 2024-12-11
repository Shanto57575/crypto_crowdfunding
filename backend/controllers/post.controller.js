import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
    try {
        const { campaignId, title, description } = req.body;

        const imagePaths = req.files.map((file) => `/uploads/posts/${file.filename}`);
        const newPost = new Post({
            campaignId,
            title,
            description,
            images: imagePaths,
        });
        const savedPost = await newPost.save();

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: savedPost,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create post",
            error: error.message,
        });
    }
};
// Get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('user').populate('comments.user');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
    }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id).populate('user').populate('comments.user');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve post', error: error.message });
    }
};

// Update a post by ID
export const updatePost = async (req, res) => {
    const { id } = req.params;
    console.log("Update request - Full Details:", {
        id,
        body: req.body,
        files: req.files
    });

    try {
        // Find existing post
        const existingPost = await Post.findById(id);
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Prepare update object
        const updateData = {};

        // Parse JSON fields if they exist
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.campaignId) updateData.campaignId = req.body.campaignId;

        // Handle image updates
        let updatedImages = existingPost.images || []; // Existing images

        // Add new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map((file) => `/uploads/posts/${file.filename}`);
            updatedImages = [...updatedImages, ...newImagePaths];
        }

        // Handle images to remove if provided
        if (req.body.removeImages) {
            const imagesToRemove = Array.isArray(req.body.removeImages)
                ? req.body.removeImages
                : [req.body.removeImages];
            updatedImages = updatedImages.filter((img) => !imagesToRemove.includes(img));
        }

        // Enforce the limit of 6 images
        if (updatedImages.length > 6) {
            return res.status(400).json({ message: "Cannot have more than 6 images." });
        }

        // Update images in the database
        updateData.images = updatedImages;

        console.log("Prepared Update Data:", updateData);

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: updatedPost
        });
    } catch (error) {
        console.error("Update Post Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update post",
            error: error.message
        });
    }
};


// Delete a post by ID
export const deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
};

// Add a comment to a post
export const addComment = async (req, res) => {
    const { id } = req.params;
    const { userId, text } = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await post.addComment(userId, text);
        res.status(200).json({ message: 'Comment added successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

// Remove a comment from a post
export const removeComment = async (req, res) => {
    const { id, commentId } = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await post.removeComment(commentId);
        res.status(200).json({ message: 'Comment removed successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove comment', error: error.message });
    }
};
