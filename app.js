const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./src/config/dataBase");
const userRoutes = require("./src/routes/userRoute");
const newsRoutes = require("./src/routes/newsRoute");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

connectDB();

app.use(async (req, res, next) => {
  try {
    await mongoose.connection.asPromise();

    next();
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/users", userRoutes);
app.use("/news", newsRoutes);


app.get("/", (req, res) => {
  res.status(200).json({
    message: "News Aggregator API is running",
  });
});

if(require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
