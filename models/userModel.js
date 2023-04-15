const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    bio: {
      type: String,
      default: 'I am a user of connectme',
    },
    profession: {
      type: String,
      default: 'Student',
    },
    education: {
      type: String,
      default: 'OAMK',
    },
    location: {
      type: String,
      default: 'Finland',
    },
    country: {
      type: String,
      default: 'Finland',
    },
    email: {
      type: String, 
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: 'img/default-profile.jpg',
    },
    cover: {
      type: String,
      default: 'img/default-cover.jpg',
    },
    refreshToken: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
