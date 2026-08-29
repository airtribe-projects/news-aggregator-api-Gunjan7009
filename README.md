# News Aggregator API

A RESTful News Aggregator API built using **Node.js, Express.js, MongoDB, JWT, bcrypt, Axios, and GNews API**.

The application allows users to create an account, log in securely, set their news preferences, fetch personalized news, search news by keywords, and manage read/favorite articles.

---

## Features

### Authentication

- User registration
- Password hashing using bcrypt
- User login
- JWT token generation
- JWT authentication middleware
- Protected routes

### User Preferences

- Get logged-in user's preferences
- Update news preferences
- Preferences are stored in MongoDB
- News is fetched based on user preferences

### News

- Fetch personalized news from GNews API
- Search news using keywords
- Get a specific article by ID
- Axios used for external API requests
- Async/Await used for API operations

### Caching

- News is cached for 30 minutes
- Reduces unnecessary calls to GNews API
- Each user has their own news cache
- Cache is refreshed when it expires
- Cache is removed when user preferences are changed

### Read / Favorite Articles

- Mark an article as read
- Mark an article as favorite
- Retrieve all read articles
- Retrieve all favorite articles
- Read/favorite status is stored separately from the temporary news cache
- User actions remain available even after the news cache expires

### Error Handling

- Authentication errors
- Invalid login credentials
- Missing required fields
- User not found
- Article not found
- News API failures
- Database errors

---

# Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| bcrypt | Password hashing |
| JSON Web Token (JWT) | Authentication |
| Axios | External API requests |
| GNews API | News data |
| dotenv | Environment variables |

---

# Project Structure

```text
news-aggregator-api/
│
├── src/
│   │
│   ├── config/
│   │   └── dataBase.js
│   │
│   ├── controllers/
│   │   ├── userController.js
│   │   └── newsController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── NewsCache.js
│   │   └── NewsArticle.js
│   │
│   ├── routes/
│   │   ├── userRoute.js
│   │   └── newsRoute.js
│   │
│   └── services/
│       └── newsService.js
│
├── test/
│   └── server.test.js
│
├── app.js
├── package.json
├── package-lock.json
├── .env
└── README.md