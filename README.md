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


## API Endpoints

All protected endpoints require a valid JWT token in the `Authorization` header.

### Authentication

#### 1. Register User

**POST** `/users/signup`

Creates a new user account. The password is hashed using bcrypt before being stored.

#### 2. Login User

**POST** `/users/login`

Authenticates an existing user and generates a JWT token.

The returned token must be used to access protected endpoints.

---

## User Preferences

For the following endpoints, send the JWT token using:

```text
Authorization: Bearer <JWT_TOKEN>
```

### 3. Get User Preferences

**GET** `/users/preferences`

Returns the news preferences of the currently authenticated user.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

### 4. Update User Preferences

**PUT** `/users/preferences`

Updates the news categories/preferences for the authenticated user.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```
When preferences are changed, the existing news cache for the user is invalidated so that news can be fetched according to the new preferences.

---

## News

### 5. Get News

**GET** `/news`

Fetches news articles based on the authenticated user's preferences.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

The application uses a cache to reduce unnecessary requests to the external GNews API.

**Response:**

```json
{
  "news": [
    {
      "id": "b3b72c2c30e6f8b62036268fff867788",
      "title": "Salman to begin Raj-DK's superhero film in January 2027",
      "description": "Salman Khan is set to begin filming...",
      "url": "https://example.com/article",
      "isRead": false,
      "isFavorite": false
    }
  ]
}
```

The `isRead` and `isFavorite` fields represent the user's interaction with each article.

---

### 6. Get Read Articles

**GET** `/news/read`

Returns all news articles that the authenticated user has marked as read.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "articles": [
    {
      "articleId": "b3b72c2c30e6f8b62036268fff867788",
      "isRead": true,
      "isFavorite": false
    }
  ]
}
```

---

### 7. Get Favorite Articles

**GET** `/news/favorite`

Returns all news articles that the authenticated user has marked as favorite.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "articles": [
    {
      "articleId": "b3b72c2c30e6f8b62036268fff867788",
      "isRead": true,
      "isFavorite": true
    }
  ]
}
```

---

### 8. Search News

**GET** `/news/search/:keyword`

Searches for news articles using a keyword.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

**Example:**

```text
GET /news/search/technology
```

**Response:**

```json
{
  "news": [
    {
      "id": "article-id",
      "title": "Latest Technology News",
      "description": "Latest updates from the technology industry",
      "isRead": false,
      "isFavorite": false
    }
  ]
}
```

---

### 9. Get News Article by ID

**GET** `/news/:id`

Returns a specific news article using its article ID.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

**Example:**

```text
GET /news/b3b72c2c30e6f8b62036268fff867788
```

**Response:**

```json
{
  "article": {
    "id": "b3b72c2c30e6f8b62036268fff867788",
    "title": "Salman to begin Raj-DK's superhero film in January 2027",
    "isRead": false,
    "isFavorite": false
  }
}
```

---

## Article Actions

### 10. Mark Article as Read

**POST** `/news/:id/read`

Marks a specific article as read for the authenticated user.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

**Example:**

```text
POST /news/b3b72c2c30e6f8b62036268fff867788/read
```

**Response:**

```json
{
  "message": "Article marked as read"
}
```

After this operation, the article will have:

```json
{
  "isRead": true
}
```

The read status is stored separately from the temporary news cache so that it is not lost when the cache expires.

---

### 11. Mark Article as Favorite

**POST** `/news/:id/favorites`

Marks a specific article as a favorite for the authenticated user.

**Headers:**

```text
Authorization: Bearer <JWT_TOKEN>
```

**Example:**

```text
POST /news/b3b72c2c30e6f8b62036268fff867788/favorites
```

**Response:**

```json
{
  "message": "Article marked as favorite"
}
```

After this operation, the article will have:

```json
{
  "isFavorite": true
}
```

Favorite status is stored persistently so that it is not lost when the news cache expires.

---

## Authentication

Protected endpoints require a JWT token.

Add the token to the request headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

If the token is missing:

```json
{
  "message": "Authentication token is required"
}
```

If the token is invalid or expired:

```json
{
  "message": "Invalid or expired token"
}
```

---

## Route Summary

| Method | Endpoint                | Authentication | Description              |
| ------ | ----------------------- | -------------- | ------------------------ |
| POST   | `/users/signup`         | No             | Register a new user      |
| POST   | `/users/login`          | No             | Login and receive JWT    |
| GET    | `/users/preferences`    | Yes            | Get user preferences     |
| PUT    | `/users/preferences`    | Yes            | Update user preferences  |
| GET    | `/news`                 | Yes            | Fetch personalized news  |
| GET    | `/news/read`            | Yes            | Get read articles        |
| GET    | `/news/favorite`        | Yes            | Get favorite articles    |
| GET    | `/news/search/:keyword` | Yes            | Search news              |
| GET    | `/news/:id`             | Yes            | Get article by ID        |
| POST   | `/news/:id/read`        | Yes            | Mark article as read     |
| POST   | `/news/:id/favorites`   | Yes            | Mark article as favorite |

## Example Authentication Flow

1. Register using `POST /users/signup`.
2. Login using `POST /users/login`.
3. Copy the JWT token from the login response.
4. Add the token to the `Authorization` header.
5. Get or update preferences.
6. Call `GET /news` to retrieve personalized news.
7. Mark articles as read or favorite.
8. Use `/news/read` or `/news/favorite` to retrieve saved articles.
9. Use `/news/search/:keyword` to search for specific topics.
