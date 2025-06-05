// Comment Document Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  commentedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  commentedDate: {
    type: Date,
    default: Date.now
  },
  commentIDs: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }],
  upvoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],  
  voteCount: {
    type: Number,
    default: 0
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null  
  }
});

commentSchema.virtual('url').get(function () {
  return `comments/${this._id}`;
});

module.exports = mongoose.model('Comment', commentSchema);

