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
        version: "1.0.0"
    });
});

app.get("/api/cars", (req, res) => {
    res.json(carsRepository.getAll());
});

app.get("/api/cars/:id", (req, res) => {
    const car = carsRepository.getById(req.params.id);

    if (!car) {
        return res.status(404).json({
            message: "Car not found"
        });
    }

    res.json(car);
});

app.get("/api/cars/random/:number", (req, res) => {
    res.json(
        carsRepository.getRandom(req.params.number)
    );
});

app.get("/api/cars/category/:category", (req, res) => {
    const cars = carsRepository.getByCategory(
        req.params.category
    );

    if (cars.length === 0) {
        return res.status(404).json({
            message: "No cars found for this category"
        });
    }

    res.json(cars);
});

module.exports = app;