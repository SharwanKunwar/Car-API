'use strict';

const cars = require('./cars');

function getAll() {
    return cars;
}

function getById(id) {
    return cars.find(car => car.id === Number(id));
}

function getRandom(numberOfCars) {
    const requested = Number(numberOfCars) || 1;
    const limit = Math.min(Math.max(requested, 1), cars.length);

    const availableCars = cars.slice();
    const result = [];

    for (let i = 0; i < limit; i++) {
        const randomIndex = Math.floor(Math.random() * availableCars.length);
        result.push(availableCars.splice(randomIndex, 1)[0]);
    }

    return result;
}

function getByCategory(category) {
    return cars.filter(
        car => car.category.toLowerCase() === String(category).toLowerCase()
    );
}

module.exports = {
    getAll,
    getById,
    getRandom,
    getByCategory
};
