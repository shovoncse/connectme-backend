const mongoose = require('mongoose');

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
    images: {
      type: [
        {
          secure_url: {
            type: String,
          },
          public_id: {
            type: String,
          },
        },
      ],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
