const axios = require("axios");

const NewsCache = require("../models/NewsCache");
const NewsArticle = require("../models/NewsArticle");

exports.getNewsFromAPI = async (userId, preferences) => {
  try {
    const existingCache = await NewsCache.findOne({
      userId: userId,
    });

    let cachePreferencesMatch = false;

    if (existingCache) {
      const oldPreferences = [...existingCache.preferences].sort();

      const newPreferences = [...preferences].sort();

      cachePreferencesMatch =
        JSON.stringify(oldPreferences) === JSON.stringify(newPreferences);
    }

    if (
      existingCache &&
      cachePreferencesMatch &&
      existingCache.expiresAt > new Date()
    ) {
      console.log("Returning news from cache");

      return await addUserStatus(userId, existingCache.articles);
    }

    console.log("Cache expired, missing, or preferences changed.");

    console.log("Fetching fresh news from GNews...");


    const query = preferences.join(" OR ");

    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: query,

        lang: "en",

        country: "in",

        max: 10,

        apikey: process.env.GNEWS_API_KEY,
      },
    });

    const articles = response.data.articles || [];
    for (const article of articles) {
      if (!article.id) {
        continue;
      }

      await NewsArticle.findOneAndUpdate(
        {
          userId: userId,
          articleId: article.id,
        },

        {
          $set: {
            title: article.title,

            description: article.description || "",

            content: article.content || "",

            url: article.url || "",

            image: article.image || "",

            publishedAt: article.publishedAt
              ? new Date(article.publishedAt)
              : null,

            source: article.source || {},
          },

          $setOnInsert: {
            isRead: false,

            isFavorite: false,
          },
        },

        {
          upsert: true,
        },
      );
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    if (existingCache) {
      existingCache.preferences = preferences;

      existingCache.articles = articles;

      existingCache.expiresAt = expiresAt;

      await existingCache.save();
    }

    else {
      await NewsCache.create({
        userId: userId,

        preferences: preferences,

        articles: articles,

        expiresAt: expiresAt,
      });
    }

    return await addUserStatus(userId, articles);
  } catch (error) {
    console.error("GNews API Error:", error.response?.data || error.message);

    throw new Error("Failed to fetch news");
  }
};

exports.searchNews = async (keyword) => {
  try {
    if (!keyword || keyword.trim() === "") {
      throw new Error("Search keyword is required");
    }

    console.log(`Searching GNews for: ${keyword}`);

    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: keyword,

        lang: "en",

        country: "in",

        max: 10,

        apikey: process.env.GNEWS_API_KEY,
      },
    });

    return response.data.articles || [];
  } catch (error) {
    console.error("GNews search error:", error.response?.data || error.message);

    throw new Error("Failed to search news");
  }
};


const addUserStatus = async (userId, articles) => {
  const articleIds = articles
    .filter((article) => article.id)
    .map((article) => article.id);

  const savedArticles = await NewsArticle.find({
    userId,
    articleId: { $in: articleIds },
  });

  const statusMap = new Map(
    savedArticles.map((article) => [
      article.articleId,
      {
        isRead: article.isRead,
        isFavorite: article.isFavorite,
      },
    ]),
  );

  return articles.map((article) => {
    const status = statusMap.get(article.id);

    return {
      ...article,
      isRead: status ? status.isRead : false,
      isFavorite: status ? status.isFavorite : false,
    };
  });
};
 