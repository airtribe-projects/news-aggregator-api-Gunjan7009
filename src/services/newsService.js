const axios = require("axios");

const NewsCache = require("../models/NewsCache");
const NewsArticle = require("../models/NewsArticle");

// ======================================================
// GET NEWS
// ======================================================

exports.getNewsFromAPI = async (userId, preferences) => {
  try {
    // ==================================================
    // 1. Find user's cache
    // ==================================================

    const existingCache = await NewsCache.findOne({
      userId: userId,
    });

    // ==================================================
    // 2. Check whether cache matches current preferences
    // ==================================================

    let cachePreferencesMatch = false;

    if (existingCache) {
      const oldPreferences = [...existingCache.preferences].sort();

      const newPreferences = [...preferences].sort();

      cachePreferencesMatch =
        JSON.stringify(oldPreferences) === JSON.stringify(newPreferences);
    }

    // ==================================================
    // 3. Return cache if:
    //
    //    - cache exists
    //    - preferences are same
    //    - cache hasn't expired
    // ==================================================

    if (
      existingCache &&
      cachePreferencesMatch &&
      existingCache.expiresAt > new Date()
    ) {
      console.log("Returning news from cache");

      return await addUserStatus(userId, existingCache.articles);
    }

    // ==================================================
    // 4. Cache missing / expired / preferences changed
    // ==================================================

    console.log("Cache expired, missing, or preferences changed.");

    console.log("Fetching fresh news from GNews...");

    // ==================================================
    // 5. Create GNews search query
    // ==================================================

    const query = preferences.join(" OR ");

    // ==================================================
    // 6. Call GNews API
    // ==================================================

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

    // ==================================================
    // 7. Save articles permanently
    //
    //    This is NOT the cache.
    //
    //    This stores read/favorite status.
    // ==================================================

    for (const article of articles) {
      if (!article.id) {
        continue;
      }

      await NewsArticle.findOneAndUpdate(
        {
          userId: userId,

          // IMPORTANT:
          // Use GNews article ID
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

          // These values are ONLY applied
          // when the article is first created.
          //
          // If the article already exists and
          // isRead=true, it stays true.
          //
          // If isFavorite=true, it stays true.

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

    // ==================================================
    // 8. Cache expiry = 30 minutes
    // ==================================================

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // ==================================================
    // 9. Update existing cache
    // ==================================================

    if (existingCache) {
      existingCache.preferences = preferences;

      existingCache.articles = articles;

      existingCache.expiresAt = expiresAt;

      await existingCache.save();
    }

    // ==================================================
    // 10. Create new cache
    // ==================================================
    else {
      await NewsCache.create({
        userId: userId,

        preferences: preferences,

        articles: articles,

        expiresAt: expiresAt,
      });
    }

    // ==================================================
    // 11. Add read/favorite status
    // ==================================================

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


// ======================================================
// ADD USER READ/FAVORITE STATUS
// ======================================================

const addUserStatus = async (userId, articles) => {
  const articlesWithStatus = [];

  for (const article of articles) {
    if (!article.id) {
      continue;
    }

    const savedArticle = await NewsArticle.findOne({
      userId: userId,

      articleId: article.id,
    });

    articlesWithStatus.push({
      ...article,

      isRead: savedArticle ? savedArticle.isRead : false,

      isFavorite: savedArticle ? savedArticle.isFavorite : false,
    });
  }

  return articlesWithStatus;
};
 