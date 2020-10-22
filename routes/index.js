'use strict';

const express = require('express');
const router = express.Router();

const userRoutes = require('./users');
const courseRoutes = require('./courses');

// Set up routes for /users and /courses
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

module.exports = router; 