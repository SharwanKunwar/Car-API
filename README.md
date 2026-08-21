# Building a REST API with Express, Deploying to Vercel & Connecting to React

A complete guide to building a database-free REST API using Node.js + Express, deploying it to Vercel, and consuming it from a React frontend.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Step 1 — Build the API with Express](#3-step-1--build-the-api-with-express)
4. [Step 2 — Test Locally](#4-step-2--test-locally)
5. [Step 3 — Deploy to Vercel](#5-step-3--deploy-to-vercel-before--after)
6. [Step 4 — Connect to a React Frontend](#6-step-4--connect-to-a-react-frontend)
7. [CORS Explained](#7-cors-explained)
8. [Local vs Production — Side by Side](#8-local-vs-production--side-by-side)
9. [Limitations of This Approach](#9-limitations-of-this-approach)
10. [Future Evolution (Adding a Database)](#10-future-evolution-adding-a-database)
11. [Quick Command Reference](#11-quick-command-reference)

---

## 1. Overview

This project is a **Car REST API** built with Node.js + Express. It has **no database** — car data lives in a plain JavaScript array and is served over HTTP.

**Why no database?** An API's job is simple:

```text
Receive Request → Process Request → Return Response
```

A database is just one way to store the data being processed. Here, the data source is a JS array instead:

```text
JavaScript Array + Express = REST API
```

This is the ideal starting point for understanding how APIs work before adding PostgreSQL, JPA, or any ORM.

**Architecture:**

```text
Client (React / Postman)
        |
        | HTTP Request
        v
   Express Server
        |
        v
  carsRepository.js   ← data access logic
        |
        v
      cars.js          ← the actual data
        |
        v
   JSON Response
```

---

## 2. Project Structure

```text
car-api/
├── api/
│   └── index.js          ← Vercel serverless entry point
├── cars.js                ← raw data
├── carsRepository.js      ← data access logic
├── server.js               ← local-only Express entry point
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

- `server.js` → used only when running locally (`app.listen`)
- `api/index.js` → used only on Vercel (`module.exports = app`)
- Both files import the same `carsRepository.js`, so your logic is never duplicated.

---

## 3. Step 1 — Build the API with Express

### 3.1 The Data File — `cars.js`

Plain array, exported as a module:

```js
'use strict';

module.exports = [
    {
        id: 1,
        name: "Toyota Supra",
        model: "GR Supra",
        category: "SPORTS",
        color: "White",
        engine: "3.0L Turbocharged Inline-6",
        price: 55000,
        speed: 250,
        imageUrl: null,
        description: "A modern Japanese sports car."
    }
];
```

### 3.2 The Repository — `carsRepository.js`

Separates **data access logic** from **HTTP routing**. This is what makes swapping to a database later easy — only this file changes, nothing in `server.js` needs to.

Exposes:

```text
getAll()
getById(id)
getRandom(numberOfCars)
getByCategory(category)
```

`getRandom` works by copying the array first (so the original is never mutated) and randomly removing entries one at a time:

```text
cars → copy array → pick random car → remove from copy → repeat → return result
```

`getByCategory` performs a **case-insensitive** match, so `/SPORTS` and `/sports` return the same results.

### 3.3 The Server — `server.js`

```js
'use strict';

const express = require('express');
const carsRepository = require('./carsRepository');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    res.json({ name: 'Car API', version: '1.0.0' });
});

app.get('/api/cars', (req, res) => {
    res.json(carsRepository.getAll());
});

app.get('/api/cars/:id', (req, res) => {
    const car = carsRepository.getById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
});

app.get('/api/cars/random/:number', (req, res) => {
    res.json(carsRepository.getRandom(req.params.number));
});

app.get('/api/cars/category/:category', (req, res) => {
    const cars = carsRepository.getByCategory(req.params.category);
    if (cars.length === 0) {
        return res.status(404).json({ message: 'No cars found for this category' });
    }
    res.json(cars);
});

app.listen(port, () => {
    console.log(`Car API running on http://localhost:${port}`);
});
```

### 3.4 Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cars` | Returns all cars |
| GET | `/api/cars/:id` | Returns one car by ID, or 404 |
| GET | `/api/cars/random/:number` | Returns N random cars, no duplicates |
| GET | `/api/cars/category/:category` | Case-insensitive category filter, or 404 |

---

## 4. Step 2 — Test Locally

```bash
cd car-api
npm install
npm start
```

Server runs at:

```text
http://localhost:3001
```

Test in a browser, curl, or Postman:

```text
GET http://localhost:3001/api/cars
GET http://localhost:3001/api/cars/1
GET http://localhost:3001/api/cars/random/3
GET http://localhost:3001/api/cars/category/SPORTS
```

Push the code to GitHub (no `index.html` needed — this is an API, not a frontend):

```bash
git init
git add .
git commit -m "Create car API"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

---

## 5. Step 3 — Deploy to Vercel (Before / After)

### 5.1 The Core Difference

| | Local (`server.js`) | Vercel (`api/index.js`) |
|---|---|---|
| Server model | Long-running Node process | Serverless function (spins up per request) |
| Entry point code | `app.listen(port, ...)` | `module.exports = app;` |
| Who starts the server | You, manually | Vercel, automatically |
| File used | `server.js` | `api/index.js` |

**Before (local):**
```js
app.listen(port, () => {
    console.log(`Car API running on http://localhost:${port}`);
});
```

**After (Vercel):**
```js
module.exports = app;
```

You **keep everything else** — routes, middleware, CORS headers, and the import of `carsRepository.js`. Only the last lines of the file change.

### 5.2 `api/index.js` (Vercel Entry Point)

```js
const express = require("express");
const carsRepository = require("../carsRepository");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/", (req, res) => {
    res.json({
        name: "Car API",
        version: "1.0.0",
        endpoints: [
            "GET /api/cars",
            "GET /api/cars/:id",
            "GET /api/cars/random/:number",
            "GET /api/cars/category/:category"
        ]
    });
});

app.get("/api/cars", (req, res) => {
    res.json(carsRepository.getAll());
});

app.get("/api/cars/:id", (req, res) => {
    const car = carsRepository.getById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
});

app.get("/api/cars/random/:number", (req, res) => {
    res.json(carsRepository.getRandom(req.params.number));
});

app.get("/api/cars/category/:category", (req, res) => {
    const cars = carsRepository.getByCategory(req.params.category);
    if (cars.length === 0) {
        return res.status(404).json({ message: "No cars found for this category" });
    }
    res.json(cars);
});

module.exports = app;
```

> Note the relative import changes from `./carsRepository` to `../carsRepository` since `api/index.js` sits one folder deeper.

### 5.3 Deployment Steps

1. Push the project to GitHub (see Step 2).
2. Open [vercel.com](https://vercel.com) and log in.
3. Click **Import Project** → select your GitHub repo.
4. Click **Deploy**.
5. Vercel gives you a public URL, e.g. `https://my-car-api.vercel.app`.

### 5.4 What Changes After Deployment

| Before deployment | After deployment |
|---|---|
| API only reachable at `localhost:3001` | API reachable from anywhere via `https://my-car-api.vercel.app` |
| You run `npm start` manually | Vercel runs the function automatically per request |
| No public URL | Public URL, shareable with any frontend |

**Before:**
```text
Your Computer
React → localhost:3001 → Car API
```

**After:**
```text
Internet → Vercel → Car API (publicly accessible)
```

---

## 6. Step 4 — Connect to a React Frontend

### 6.1 Before Deployment (Local Development)

```js
const response = await fetch('http://localhost:3001/api/cars');
const cars = await response.json();
```

Or with Axios:

```js
const response = await axios.get('http://localhost:3001/api/cars');
console.log(response.data);
```

### 6.2 After Deployment (Production)

Only the base URL changes:

```js
fetch('https://my-car-api.vercel.app/api/cars');
```

### 6.3 Best Practice — Use Environment Variables Instead of Hardcoding

Don't hardcode either URL. Use a Vite environment variable so you never touch the source code again when the backend URL changes.

**`.env.development`**
```env
VITE_API_URL=http://localhost:3001
```

**Vercel project settings (production env variable)**
```env
VITE_API_URL=https://my-car-api.vercel.app
```

**React code (stays the same everywhere):**
```js
const API_URL = import.meta.env.VITE_API_URL;

const response = await fetch(`${API_URL}/api/cars`);
const cars = await response.json();
```

---

## 7. CORS Explained

Browsers block cross-origin requests by default (e.g. React on `localhost:5173` calling an API on `localhost:3001`). This project allows all origins via:

```js
res.set('Access-Control-Allow-Origin', '*');
```

```text
React (localhost:5173)  --HTTP-->  Car API (localhost:3001)
```

Without this header, the browser would block the request even though the server is running fine.

---

## 8. Local vs Production — Side by Side

**Local**
```text
React → http://localhost:3001 → Express → cars.js
```

**Production**
```text
React → https://my-car-api.vercel.app → Vercel Function → cars.js
```

**Full production architecture (both apps deployed):**

```text
                    INTERNET
                       |
          ┌────────────┴────────────┐
          |                         |
          v                         v
  React (Vercel)             Car API (Vercel)
          |                         |
          |        HTTPS            |
          └────────────────────────►|
                                    v
                             carsRepository.js
                                    |
                                    v
                                cars.js
```

---

## 9. Limitations of This Approach

The car data lives in an **in-memory JavaScript array** — this is not permanent storage.

If you later add a write endpoint:

```http
POST /api/cars
```

```js
cars.push(newCar);
```

⚠️ **Do not expect this to persist** on Vercel. Serverless functions are stateless and can restart or reset between invocations — any in-memory changes disappear.

For real persistence, you need a database:

```text
React → API → PostgreSQL
```

---

## 10. Future Evolution (Adding a Database)

**Current architecture:**
```text
React → Express → Repository → cars.js
```

**Target architecture:**
```text
React → Controller → Service → Repository → PostgreSQL
```

**Future endpoints to add:**

```http
POST   /api/cars
GET    /api/cars
GET    /api/cars/:id
PUT    /api/cars/:id
PATCH  /api/cars/:id
DELETE /api/cars/:id
```

**Future features to consider:**

- PostgreSQL + full CRUD
- Validation
- Pagination, sorting, searching
- Price / category filtering
- Authentication + JWT
- Admin dashboard
- Image storage
- Swagger / OpenAPI docs
- Global error handling
- DTOs

---

## 11. Quick Command Reference

```bash
# Install dependencies
npm install

# Start locally
npm start

# Development mode (if configured with nodemon)
npm run dev

# Git deployment
git add .
git commit -m "Create car API"
git push
```

**Test endpoints locally:**
```text
http://localhost:3001/api/cars
http://localhost:3001/api/cars/1
http://localhost:3001/api/cars/random/3
http://localhost:3001/api/cars/category/SPORTS
```

---

## Final Mental Model

```text
Client
  |
  | HTTP request
  v
Server (Express / Vercel Function)
  |
  | route
  v
Business/Data Logic (Repository)
  |
  v
Data (Array or Database)
  |
  v
HTTP Response
```

A database is optional — it only becomes necessary once you need data that is **persistent, shared, and mutable**. Until then:

```text
JavaScript Array + Express = REST API
```

And the deployment path is always the same:

```text
GitHub → Vercel → Public API URL → Consumed by React
```