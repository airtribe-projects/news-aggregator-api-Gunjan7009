const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  signup,
  login,
  getPreferences,
  updatePreferences,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/preferences", authMiddleware, getPreferences);
router.put("/preferences", authMiddleware, updatePreferences);

module.exports = router;
