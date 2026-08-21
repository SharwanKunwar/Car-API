'use strict';

const cars = require('./cars');

function getAll() {
    return cars;
}

function getById(id) {
    return cars.find(
        car => car.id === Number(id)
    );
}

function getRandom(numberOfCars) {
    const requestedNumber = Number(numberOfCars);

    const number =
        Number.isInteger(requestedNumber) &&
        requestedNumber > 0
            ? requestedNumber
            : 1;

    const limit = Math.min(
        number,
        cars.length
    );

    const availableCars = [...cars];

    const result = [];

    for (let i = 0; i < limit; i++) {
        const randomIndex = Math.floor(
            Math.random() * availableCars.length
        );

        const randomCar =
            availableCars.splice(
                randomIndex,
                1
            )[0];

        result.push(randomCar);
    }

    return result;
}

function getByCategory(category) {
    const requestedCategory =
        String(category).toLowerCase();

    return cars.filter(
        car =>
            car.category.toLowerCase() ===
            requestedCategory
    );
}

module.exports = {
    getAll,
    getById,
    getRandom,
    getByCategory
};