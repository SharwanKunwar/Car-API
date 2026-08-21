# Car API — Complete Project & Deployment Guide

## 1. Project Overview

This project is a simple **Car REST API built with Node.js and Express**.

The API does **not use a database**. Car information is stored in a JavaScript array and exposed through HTTP endpoints.

The core architecture is:

```text
Client
   |
   | HTTP Request
   v
Express Server
   |
   v
carsRepository.js
   |
   v
cars.js
   |
   v
JSON Response
```

The main purpose of this project is to understand how an API works before introducing a database such as PostgreSQL.

---

# 2. Why This API Does Not Need a Database

An API does not automatically require a database.

At its simplest, an API needs to:

```text
Receive Request
      |
      v
Process Request
      |
      v
Return Response
```

This project uses:

```text
JavaScript Array
       +
Express
       =
REST API
```

The car data is stored in:

```text
cars.js
```

For example:

```js
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
    description: "A modern Japanese sports car..."
}
```

There is no PostgreSQL, MySQL, MongoDB, JPA, or ORM in this version.

---

# 3. Project Structure

The project can have this structure:

```text
car-api/
├── api/
│   └── index.js
├── cars.js
├── carsRepository.js
├── server.js
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

For local-only Express usage, `server.js` can be used.

For Vercel deployment, `api/index.js` should be the serverless entry point.

---

# 4. The Three Main Files

## `cars.js`

This contains the actual car data.

Example:

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

Think of this file as a simple static data source.

---

## `carsRepository.js`

This contains the logic used to access the car data.

Example operations:

```js
getAll()
getById(id)
getRandom(numberOfCars)
getByCategory(category)
```

The repository separates data operations from HTTP routing.

The architecture becomes:

```text
server.js
    |
    | HTTP / routing
    v
carsRepository.js
    |
    | data operations
    v
cars.js
```

This separation becomes especially useful if the project is later changed to use PostgreSQL.

---

# 5. Local Express Server

A simple local `server.js` can look like:

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
    res.json({
        name: 'Car API',
        version: '1.0.0'
    });
});

app.get('/api/cars', (req, res) => {
    res.json(carsRepository.getAll());
});

app.get('/api/cars/:id', (req, res) => {
    const car = carsRepository.getById(req.params.id);

    if (!car) {
        return res.status(404).json({
            message: 'Car not found'
        });
    }

    res.json(car);
});

app.get('/api/cars/random/:number', (req, res) => {
    res.json(
        carsRepository.getRandom(req.params.number)
    );
});

app.get('/api/cars/category/:category', (req, res) => {
    const cars = carsRepository.getByCategory(
        req.params.category
    );

    if (cars.length === 0) {
        return res.status(404).json({
            message: 'No cars found for this category'
        });
    }

    res.json(cars);
});

app.listen(port, () => {
    console.log(
        `Car API running on http://localhost:${port}`
    );
});
```

---

# 6. Running Locally

## Step 1 — Open the project

```bash
cd car-api
```

## Step 2 — Install dependencies

```bash
npm install
```

## Step 3 — Start the server

```bash
npm start
```

The server should run at:

```text
http://localhost:3001
```

---

# 7. Check the API

Open:

```text
http://localhost:3001
```

You should receive JSON describing the API.

---

# 8. API Endpoints

The API provides these endpoints:

```text
GET /api/cars
GET /api/cars/:id
GET /api/cars/random/:number
GET /api/cars/category/:category
```

---

## Get All Cars

```http
GET /api/cars
```

Local:

```text
http://localhost:3001/api/cars
```

Example response:

```json
[
    {
        "id": 1,
        "name": "Toyota Supra",
        "model": "GR Supra",
        "category": "SPORTS",
        "color": "White",
        "engine": "3.0L Turbocharged Inline-6",
        "price": 55000,
        "speed": 250,
        "imageUrl": null,
        "description": "A modern Japanese sports car."
    }
]
```

---

# 9. Get One Car

```http
GET /api/cars/:id
```

Example:

```text
http://localhost:3001/api/cars/1
```

The `:id` is the car ID.

If the car exists, the API returns the car.

If it does not exist:

```json
{
    "message": "Car not found"
}
```

with:

```text
404 Not Found
```

---

# 10. Get Random Cars

```http
GET /api/cars/random/:number
```

Example:

```text
http://localhost:3001/api/cars/random/3
```

This returns three randomly selected cars.

The repository uses:

```js
Math.random()
```

to choose the cars.

The original array is not modified because the repository first creates a copy.

Conceptually:

```text
cars
 |
 v
copy array
 |
 v
choose random car
 |
 v
remove selected car from copy
 |
 v
repeat
 |
 v
return result
```

Therefore, the same request does not return the same car twice.

---

# 11. Get Cars By Category

```http
GET /api/cars/category/:category
```

Example:

```text
http://localhost:3001/api/cars/category/SPORTS
```

The category lookup is case-insensitive.

Therefore:

```text
/api/cars/category/SPORTS
```

and:

```text
/api/cars/category/sports
```

can return the same results.

If there are no matching cars:

```json
{
    "message": "No cars found for this category"
}
```

---

# 12. Using Postman

Postman can be used to test the API without a frontend.

For local development:

### Get all cars

```text
GET http://localhost:3001/api/cars
```

### Get one car

```text
GET http://localhost:3001/api/cars/1
```

### Get random cars

```text
GET http://localhost:3001/api/cars/random/3
```

### Get category

```text
GET http://localhost:3001/api/cars/category/SPORTS
```

---

# 13. Using the API From React

A React frontend can call:

```js
const response = await fetch(
    'http://localhost:3001/api/cars'
);

const cars = await response.json();

console.log(cars);
```

Or with Axios:

```js
const response = await axios.get(
    'http://localhost:3001/api/cars'
);

console.log(response.data);
```

The flow is:

```text
React
  |
  | fetch()
  v
http://localhost:3001/api/cars
  |
  v
Express
  |
  v
carsRepository.js
  |
  v
cars.js
  |
  v
JSON
```

---

# 14. CORS

The API includes CORS support:

```js
res.set('Access-Control-Allow-Origin', '*');
```

This allows a frontend hosted on another origin to request the API.

For example:

```text
React
http://localhost:5173
       |
       | HTTP request
       v
Car API
http://localhost:3001
```

Without appropriate CORS headers, browsers can block cross-origin requests.

---

# 15. Deploying to GitHub

There is no need for an `index.html`.

This is an API project, not a frontend project.

A frontend application may have:

```text
index.html
src/
```

but the API does not need that.

You can push the API project directly to GitHub.

Example:

```bash
git init
git add .
git commit -m "Create car API"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

---

# 16. Important Vercel Difference

The local version uses:

```js
app.listen(port, ...)
```

That is suitable for a normal Node.js server running on your computer.

Vercel uses a serverless/function-based deployment model.

Therefore, before deploying the API to Vercel, the Express application should be exported instead of manually starting the server.

Instead of:

```js
app.listen(port);
```

the Vercel entry point should use:

```js
module.exports = app;
```

---

# 17. Vercel Project Structure

For Vercel, use:

```text
car-api/
├── api/
│   └── index.js
├── cars.js
├── carsRepository.js
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

The important file is:

```text
api/index.js
```

This becomes the Vercel API function.

---

# 18. Vercel `api/index.js`

A Vercel-compatible Express entry point can be:

```js
const express = require("express");
const carsRepository = require("../carsRepository");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

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
    res.json(
        carsRepository.getAll()
    );
});

app.get("/api/cars/:id", (req, res) => {
    const car = carsRepository.getById(
        req.params.id
    );

    if (!car) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    res.json(car);
});

app.get(
    "/api/cars/random/:number",
    (req, res) => {
        res.json(
            carsRepository.getRandom(
                req.params.number
            )
        );
    }
);

app.get(
    "/api/cars/category/:category",
    (req, res) => {
        const cars =
            carsRepository.getByCategory(
                req.params.category
            );

        if (cars.length === 0) {
            return res.status(404).json({
                message:
                    "No cars found for this category"
            });
        }

        res.json(cars);
    }
);

module.exports = app;
```

The important difference is:

```js
module.exports = app;
```

instead of:

```js
app.listen(port);
```

Vercel handles the request execution.

---

# 19. Deploying To Vercel

After pushing the project to GitHub:

1. Open Vercel.
2. Import your GitHub repository.
3. Select the Car API repository.
4. Deploy it.
5. Vercel gives you a public domain.

For example:

```text
https://my-car-api.vercel.app
```

Now the API can be accessed over the internet.

---

# 20. What Happens After Deployment?

Before deployment:

```text
Your Computer

React
  |
  v
localhost:3001
  |
  v
Car API
```

Only your local environment is running the API.

After deployment:

```text
Internet
    |
    v
Vercel
    |
    v
Car API
```

Your API becomes publicly accessible.

For example:

```text
https://my-car-api.vercel.app/api/cars
```

Anyone who has access to the URL can make an HTTP request to it, subject to any access controls you later add.

---

# 21. Do You Change the URL After Deployment?

Yes.

During development:

```js
fetch(
    "http://localhost:3001/api/cars"
);
```

After deployment:

```js
fetch(
    "https://my-car-api.vercel.app/api/cars"
);
```

The API base URL changes from:

```text
http://localhost:3001
```

to:

```text
https://my-car-api.vercel.app
```

---

# 22. Better Approach — Environment Variables

Instead of hardcoding URLs throughout your React project, use an environment variable.

For Vite:

```js
const API_URL = import.meta.env.VITE_API_URL;
```

Then:

### Development

`.env.development`

```env
VITE_API_URL=http://localhost:3001
```

### Production

Set the Vercel environment variable:

```env
VITE_API_URL=https://my-car-api.vercel.app
```

Then your React code stays:

```js
fetch(
    `${API_URL}/api/cars`
);
```

This is better because the source code does not need to be changed every time the backend URL changes.

---

# 23. Production Architecture

After deploying both applications:

```text
                    INTERNET
                       |
          ┌────────────┴────────────┐
          |                         |
          v                         v
 React/Vercel                  Car API/Vercel
          |                         |
          |       HTTPS             |
          └────────────────────────►|
                                    |
                                    v
                             carsRepository.js
                                    |
                                    v
                                cars.js
```

Your React application calls the deployed API.

---

# 24. What Happens To `cars.js` After Deployment?

The data is still stored in:

```text
cars.js
```

Vercel deploys the project code.

When the API function executes, it loads:

```text
api/index.js
      |
      v
carsRepository.js
      |
      v
cars.js
```

There is still no database.

---

# 25. Important Limitation With Vercel

Do not treat an in-memory JavaScript array as permanent storage.

For example, if you eventually implement:

```http
POST /api/cars
```

and do:

```js
cars.push(newCar);
```

you should not expect that change to become permanent on a serverless deployment.

Serverless execution is not a replacement for a database.

For persistent data, use:

```text
React
   |
   v
API
   |
   v
PostgreSQL
```

---

# 26. Local vs Production

## Local

```text
React
   |
   v
http://localhost:3001
   |
   v
Express
   |
   v
cars.js
```

## Production

```text
React
   |
   v
https://my-car-api.vercel.app
   |
   v
Vercel Function
   |
   v
cars.js
```

---

# 27. Why This Project Is Useful

This project is a good starting point for learning backend development because it demonstrates:

- HTTP
- REST APIs
- Routes
- Request parameters
- JSON responses
- Express
- CORS
- Repository-style separation
- Random data selection
- API consumption from React
- Postman testing
- GitHub deployment
- Vercel deployment
- Environment variables

---

# 28. Future Evolution

The current architecture is:

```text
React
  |
  v
Express
  |
  v
Repository
  |
  v
cars.js
```

A more complete backend can eventually become:

```text
React
  |
  v
Controller
  |
  v
Service
  |
  v
Repository
  |
  v
PostgreSQL
```

Possible future endpoints:

```http
POST   /api/cars
GET    /api/cars
GET    /api/cars/:id
PUT    /api/cars/:id
PATCH  /api/cars/:id
DELETE /api/cars/:id
```

Possible future features:

- PostgreSQL
- CRUD operations
- Validation
- Pagination
- Sorting
- Searching
- Price filtering
- Category filtering
- Authentication
- JWT
- Admin dashboard
- Image storage
- Swagger/OpenAPI
- Global error handling
- DTOs

---

# 29. Final Mental Model

The most important thing to remember is:

```text
                    API

Client
  |
  | HTTP request
  v
Server
  |
  | route
  v
Business/Data Logic
  |
  v
Data
  |
  v
HTTP Response
```

For this project:

```text
Client
  |
  v
Express
  |
  v
carsRepository.js
  |
  v
cars.js
  |
  v
JSON Response
```

A database is optional.

The database becomes important when you need persistent, shared, mutable data.

---

# 30. Quick Commands

### Install

```bash
npm install
```

### Start locally

```bash
npm start
```

### Development mode

```bash
npm run dev
```

### Test all cars

```text
http://localhost:3001/api/cars
```

### Test one car

```text
http://localhost:3001/api/cars/1
```

### Test random cars

```text
http://localhost:3001/api/cars/random/3
```

### Test category

```text
http://localhost:3001/api/cars/category/SPORTS
```

### Git

```bash
git add .
git commit -m "Create car API"
git push
```

---

# Conclusion

This Car API is a small but complete REST API.

It starts with:

```text
JavaScript Array
        +
Express
        =
REST API
```

It can then be deployed:

```text
GitHub
   |
   v
Vercel
   |
   v
Public API URL
```

And your React frontend can consume the deployed API:

```text
React
   |
   | HTTPS
   v
https://my-car-api.vercel.app/api/cars
```

The project can later evolve from a static-data API into a full backend with:

```text
React
   |
   v
Backend
   |
   v
Service
   |
   v
Repository
   |
   v
PostgreSQL
```

That progression is the main learning path of this project.