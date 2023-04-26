const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    commentContent: {
      type: String,
      required: true,
    },
    likes: [],
    numLikes: {
      type: Number,
      required: true,
      default: 0,
    },
    isLiked: {
      type: Boolean,
      required: true,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const likeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    postContent: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    comments: [commentSchema],
    numComments: {
      type: Number,
      required: true,
      default: 0,
    },
    likes: [likeSchema],
    numLikes: {
      type: Number,
      required: true,
      default: 0,
    },
    isLiked: {
      type: Boolean,
      required: true,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
