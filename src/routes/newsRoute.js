const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNews,
  getNewsById,
  markAsRead,
  markAsFavorite,
  getReadArticles,
  getFavoriteArticles,
  searchNews,
} = require("../controllers/newsController");


const router = express.Router();

router.get("/", authMiddleware, getNews);
router.get("/read", authMiddleware, getReadArticles);
router.get("/favorite", authMiddleware, getFavoriteArticles);
router.get("/search/:keyword", authMiddleware, searchNews);
router.get("/:id", authMiddleware, getNewsById);
router.post("/:id/read", authMiddleware, markAsRead);
router.post("/:id/favorites", authMiddleware, markAsFavorite);


module.exports = router;
