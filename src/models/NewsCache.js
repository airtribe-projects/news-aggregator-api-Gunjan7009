const mongoose = require("mongoose");

const newsCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    preferences: {
      type: [String],
      required: true,
    },

    articles: {
      type: Array,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

newsCacheSchema.index(
  {
    userId: 1,
  },
  {
    unique: true,
  },
);

const NewsCache = mongoose.model("NewsCache", newsCacheSchema);

module.exports = NewsCache;
