'use strict';

const express = require('express');
const router = express.Router();

// import Sequelize and models
const { sequelize, User } = require('../models');

router.get('/', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

module.exports = router; 