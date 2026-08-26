const mongoose = require("mongoose");

const newsArticleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // GNews article ID
    articleId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    url: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    source: {
      type: Object,
      default: {},
    },

    // Permanent user state
    isRead: {
      type: Boolean,
      default: false,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Same user cannot have duplicate
// records for the same article
newsArticleSchema.index(
  {
    userId: 1,
    articleId: 1,
  },
  {
    unique: true,
  },
);

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);

module.exports = NewsArticle;
