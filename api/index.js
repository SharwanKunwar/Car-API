'use strict';

const express = require('express');

const carsRepository =
    require('../carsRepository');

const app = express();

app.use(express.json());

/*
 * CORS
 */
app.use((req, res, next) => {
    res.setHeader(
        'Access-Control-Allow-Origin',
        '*'
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

/*
 * Home
 */
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        name: 'Car API',
        version: '1.0.0',
        message: 'Car API is running successfully.',
        endpoints: {
            allCars: 'GET /api/cars',
            carById: 'GET /api/cars/:id',
            randomCars:
                'GET /api/cars/random/:number',
            byCategory:
                'GET /api/cars/category/:category'
        }
    });
});

/*
 * GET ALL CARS
 *
 * GET /api/cars
 */
app.get('/api/cars', (req, res) => {
    try {
        const cars =
            carsRepository.getAll();

        return res.status(200).json({
            success: true,
            count: cars.length,
            data: cars
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch cars.'
        });
    }
});

/*
 * GET CAR BY ID
 *
 * GET /api/cars/1
 */
app.get('/api/cars/:id', (req, res) => {
    try {
        const car =
            carsRepository.getById(
                req.params.id
            );

        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: car
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch car.'
        });
    }
});

/*
 * GET RANDOM CARS
 *
 * GET /api/cars/random/3
 */
app.get(
    '/api/cars/random/:number',
    (req, res) => {
        try {
            const number =
                Number(req.params.number);

            if (
                !Number.isInteger(number) ||
                number <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Number must be a positive integer.'
                });
            }

            const cars =
                carsRepository.getRandom(
                    number
                );

            return res.status(200).json({
                success: true,
                count: cars.length,
                data: cars
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    'Failed to fetch random cars.'
            });
        }
    }
);

/*
 * GET CARS BY CATEGORY
 *
 * GET /api/cars/category/SPORTS
 */
app.get(
    '/api/cars/category/:category',
    (req, res) => {
        try {
            const cars =
                carsRepository.getByCategory(
                    req.params.category
                );

            if (cars.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        'No cars found for this category.'
                });
            }

            return res.status(200).json({
                success: true,
                count: cars.length,
                data: cars
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    'Failed to fetch cars by category.'
            });
        }
    }
);

/*
 * 404 HANDLER
 */
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Endpoint not found.'
    });
});

/*
 * GLOBAL ERROR HANDLER
 */
app.use((error, req, res, next) => {
    console.error(error);

    return res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

/*
 * IMPORTANT:
 *
 * Do NOT use app.listen() here.
 *
 * Vercel handles the server.
 */
module.exports = app;