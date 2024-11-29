import mongoose from 'mongoose';

// Comment Schema (embedded within Post)
const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PostSchema = new mongoose.Schema(
    {
        campaignId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, 'Description cannot be more than 1000 characters'],
        },
        images: {
            type: [String],
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true,
        },
        comments: [CommentSchema],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

PostSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});

PostSchema.methods.addComment = async function (userId, commentText) {
    this.comments.push({
        user: userId,
        text: commentText,
    });
    return this.save();
};

PostSchema.methods.removeComment = async function (commentId) {
    this.comments = this.comments.filter(
        (comment) => comment._id.toString() !== commentId.toString()
    );
    return this.save();
};

const Post = mongoose.model('Post', PostSchema);

export default Post;
