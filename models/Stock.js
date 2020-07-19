const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  bullish: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  bearish: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    },
    text: {
      type: String,
      required: true
    }
  }],
});

module.exports = Stock = mongoose.model('stock', StockSchema);