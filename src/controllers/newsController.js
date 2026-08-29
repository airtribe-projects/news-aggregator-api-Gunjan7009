const User = require("../models/User");

const NewsCache = require("../models/NewsCache");
const NewsArticle = require("../models/NewsArticle");

const { getNewsFromAPI, searchNews } = require("../services/newsService");

exports.getNews = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const preferences = user.preferences;

    if (!preferences || preferences.length === 0) {
      return res.status(400).json({
        message: "No news preferences found",
      });
    }

    const articles = await getNewsFromAPI(userId, preferences);


    return res.status(200).json({
      news: articles,
    });
  } catch (error) {
    console.error("Get news error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch news",
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = req.params.id;

    const article = await NewsArticle.findOne({
      userId: userId,
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    return res.status(200).json({
      article: article,
    });

  } catch (error) {
    console.error("Get news by ID error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch news by ID",
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = req.params.id;

    const article = await NewsArticle.findOneAndUpdate(
      {
        userId: userId,
        articleId: articleId,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    const cache = await NewsCache.findOne({
      userId: userId,
    });

    if (cache) {
      const cachedArticle = cache.articles.find(
        (item) => item.id === articleId,
      );

      if (cachedArticle) {
        cachedArticle.isRead = true;

        await cache.save();
      }
    }


    return res.status(200).json({
      message: "Article marked as read",

      article: {
        articleId: article.articleId,
        isRead: article.isRead,
        isFavorite: article.isFavorite,
      },
    });
  } catch (error) {
    console.error("Mark read error:", error.message);

    return res.status(500).json({
      message: "Failed to mark article as read",
    });
  }
};
exports.markAsFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = req.params.id;

    const article = await NewsArticle.findOneAndUpdate(
      {
        userId: userId,
        articleId: articleId,
      },
      {
        $set: {
          isFavorite: true,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    const cache = await NewsCache.findOne({
      userId: userId,
    });

    if (cache) {
      const cachedArticle = cache.articles.find(
        (item) => item.id === articleId,
      );

      if (cachedArticle) {
        cachedArticle.isFavorite = true;

        await cache.save();
      }
    }

    return res.status(200).json({
      message: "Article marked as favorite",

      article: {
        articleId: article.articleId,
        isRead: article.isRead,
        isFavorite: article.isFavorite,
      },
    });
  } catch (error) {
    console.error("Mark favorite error:", error.message);

    return res.status(500).json({
      message: "Failed to mark article as favorite",
    });
  }
};

exports.getReadArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    const articles = await NewsArticle.find({
      userId: userId,
      isRead: true,
    });

    return res.status(200).json({
      news: articles,
    });
  } catch (error) {
    console.error("Get read articles error:", error.message);

    return res.status(500).json({
      message: "Failed to get read articles",
    });
  }
};

exports.getFavoriteArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    const articles = await NewsArticle.find({
      userId: userId,
      isFavorite: true,
    });

    return res.status(200).json({
      news: articles,
    });
  } catch (error) {
    console.error("Get favorite articles error:", error.message);

    return res.status(500).json({
      message: "Failed to get favorite articles",
    });
  }
};

exports.searchNews = async (req, res) => {

  try {

    const keyword =
      req.params.keyword;


    if (
      !keyword ||
      keyword.trim() === ""
    ) {

      return res.status(400).json({
        message:
          "Search keyword is required",
      });
    }


    const articles =
      await searchNews(keyword);


    return res.status(200).json({
      news: articles,
    });


  } catch (error) {

    console.error(
      "Search news error:",
      error.message
    );


    return res.status(500).json({
      message:
        "Failed to search news",
    });
  }
};