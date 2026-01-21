## PushpendraSingh AtDrive Hiring API

Node.js REST API for managing **users**, **products**, **orders** and a simple **weather** integration.  
Authentication is done with **JWT**. Data is stored in **MySQL** (users) and **MongoDB** (products, orders, weather counters).

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Databases**:
  - MySQL via Sequelize (`users` table)
  - MongoDB via Mongoose (`products`, `orders`, counters)
- **Auth**: JWT (`jsonwebtoken`, custom middleware)
- **Other**: Axios (Weather API), CORS, dotenv

---

## Getting Started

### 1. Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- **MySQL** database
- **MongoDB** instance
- An **OpenWeatherMap API key** (for weather endpoint)

### 2. Install dependencies

From the project root:

```bash
npm install
```

### 3. Environment configuration

Create a file named `config.env` in the project root (same level as `server.js`) and set the following variables:

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/your_db_name

# MySQL
MYSQL_DB=your_mysql_db_name
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key

# Weather (OpenWeatherMap)
WEATHER_API_KEY=your_openweather_api_key
```

> **Note**: MySQL must contain a `users` table as defined by the Sequelize model in `src/model/user.model.js`.

### 4. Run the API

```bash
npm run dev
```

By default, the server runs on:

- **Base URL**: `http://localhost:2000`

Health-check:

- **GET** `/` → returns `"Hello World! Project is running"`

---

## Authentication

- JWT-based authentication.
- After successful login you receive a token.
- Send the token in the **Authorization** header:

```http
Authorization: Bearer <token>
```

Protected routes use the `auth` middleware and will return:

```json
{
  "success": false,
  "message": "Access token is required"
}
```

if no token is provided (or corresponding error messages for invalid/expired tokens).

---

## API Overview

Base prefix for APIs:

- `http://localhost:2000/api/user`
- `http://localhost:2000/api/product`
- `http://localhost:2000/api/order`
- `http://localhost:2000/api/weather`

Below are the main endpoints and example request/response bodies.

---

## User APIs (`/api/user`)

### 1. Create User

- **POST** `/api/user/create`
- **Auth**: Not required

**Request body:**

```json
{
  "name": "John Doe",
  "username": "john",
  "password": "password123"
}
```

**Successful response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "username": "john",
    "status": true,
    "createdBy": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Login

- **POST** `/api/user/login`
- **Auth**: Not required

**Request body:**

```json
{
  "username": "john",
  "password": "password123"
}
```

**Successful response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt-token>"
}
```

Use this token in the `Authorization` header for all protected endpoints.

### 3. Validate Token

- **POST** `/api/user/validate-token`
- **Auth**: Token sent in `Authorization` header (Bearer)

**Headers:**

```http
Authorization: Bearer <token>
```

**Example success response:**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "expired": false,
    "user": {
      "user_id": 1,
      "username": "john"
    }
  }
}
```

### 4. Logout

- **POST** `/api/user/logout`
- **Auth**: Required

**Example response:**

```json
{
  "success": true,
  "message": "Logout successful. Please discard the token on client side."
}
```

### 5. Update User

- **PUT** `/api/user/update/:id`
- **Auth**: Required

Partial body allowed, example:

```json
{
  "name": "Updated Name",
  "status": false
}
```

### 6. Delete User (Soft Delete)

- **DELETE** `/api/user/delete/:id`
- **Auth**: Required

### 7. Get User by ID

- **GET** `/api/user/getbyid/:id`
- **Auth**: Required

### 8. Get All Users

- **GET** `/api/user/getall`
- **Auth**: Required

All user-related responses follow the pattern:

```json
{
  "success": true | false,
  "message": "Message text",
  "data": ...,
  "error": "error message if any"
}
```

---

## Product APIs (`/api/product`)

> **Note**: All product endpoints require a valid JWT token.
>
> Add header `Authorization: Bearer <token>`.

### 1. Create Product

- **POST** `/api/product/create`

**Body:**

```json
{
  "name": "Laptop",
  "price": 999.99,
  "description": "High performance laptop",
  "status": true
}
```

**Example response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": 1,
    "name": "Laptop",
    "price": 999.99,
    "description": "High performance laptop",
    "status": true,
    "createdBy": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Update Product

- **PUT** `/api/product/update/:id`

Partial body allowed, same fields as create.

### 3. Soft Delete Product

- **DELETE** `/api/product/delete/:id`

### 4. Get Product by ID

- **GET** `/api/product/getbyid/:id`

### 5. Get All Products

- **GET** `/api/product/getall`

---

## Order APIs (`/api/order`)

> **Note**: All order endpoints require a valid JWT token.
>
> `user_id` maps to the MySQL `users` table, products map to Mongo `products`.

### 1. Create Order

- **POST** `/api/order/create`

**Body:**

```json
{
  "products": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ],
  "status": true
}
```

**Example success response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "order_id": 1,
      "user_id": 1,
      "products": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 2, "quantity": 1 }
      ],
      "totalAmount": 2999.97,
      "status": true,
      "createdBy": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "summary": {
      "totalAmount": 2999.97,
      "products": [
        {
          "product_id": 1,
          "quantity": 2,
          "price": 999.99,
          "lineTotal": 1999.98
        },
        {
          "product_id": 2,
          "quantity": 1,
          "price": 999.99,
          "lineTotal": 999.99
        }
      ]
    }
  }
}
```

### 2. Update Order

- **PUT** `/api/order/update/:id`

Body similar to create; if `products` not passed, existing products are reused.

### 3. Soft Delete Order

- **DELETE** `/api/order/delete/:id`

### 4. Get Order by ID (Populated)

- **GET** `/api/order/getbyid/:id`

**Example of populated response:**

```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "order_id": 1,
    "user_id": 1,
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "username": "john",
      "status": true
    },
    "products": [
      {
        "product_id": 1,
        "quantity": 2,
        "product": {
          "product_id": 1,
          "name": "Laptop",
          "price": 999.99,
          "description": "High performance laptop",
          "status": true
        },
        "lineTotal": 1999.98
      }
    ],
    "totalAmount": 1999.98
  }
}
```

### 5. Get All Orders (Populated)

- **GET** `/api/order/getall`

**Response:** list of orders, each fully populated with user and product info.

---

## Weather API (`/api/weather`)

### 1. Get Current Weather

- **GET** `/api/weather/current?city=London`
- **Auth**: Not required

Query params:

- **city** (optional, default = `"London"`)

**Example success response:**

```json
{
  "success": true,
  "message": "Weather fetched successfully",
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": 12.34,
    "feelsLike": 10.5,
    "description": "broken clouds",
    "humidity": 70,
    "windSpeed": 3.6,
    "raw": { "...": "Full OpenWeather response" }
  }
}
```

If `WEATHER_API_KEY` is not configured you get:

```json
{
  "success": false,
  "message": "WEATHER_API_KEY is not configured on the server"
}
```

---

## Common Error Response Format

Most endpoints use this pattern on failure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message if available"
}
```

---

## How to Run Quickly (Summary)

1. **Clone** the project into your local machine.
2. Run **`npm install`**.
3. Create `config.env` with MongoDB, MySQL, JWT, and Weather variables.
4. Ensure MySQL & MongoDB are running.
5. Run **`npm run dev`**.
6. Test base URL: **GET** `http://localhost:2000/`.
7. Register a user via **POST** `/api/user/create`, login via `/api/user/login`, then call protected endpoints with the JWT token.

This README now contains the **full API info, how to run, and example responses** for all main endpoints.