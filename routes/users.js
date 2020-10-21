'use strict';

const express = require('express');
const { authenticateUser } = require('../middleware/auth-user');
const router = express.Router();

// import Sequelize and models
const { sequelize, User } = require('../models');

function asyncHandler(cb){
    return async (req,res, next) => {
        try {
            await cb(req, res, next);
        } catch(err) {
            next(err);
        }
    }
}

// Returns the currently authenticated user
router.get('/', authenticateUser, asyncHandler(async (req, res)=> {
    // const users = await User.findAll();
    // if(users) {
    //     res.status(200).json(users);
    // } else {
    //     res.status(404).json({message: "Could not retrieve users"})
    // }

    // Retrieve the current authenticated user's information from the Request object's currentUser property:
    const user = req.currentUser;

    // Use the Response object's json() method to return the current user's information formatted as JSON
    res.status(200).json({
        name: user.name,
        username: user.username
    });

}));

// Creates a user, sets the Location header to "/", and returns no content
router.post('/', asyncHandler(async (req, res)=> {
    try {
        await User.create(req.body);
        res.status(201).json({message: "User successfully created"})
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));



module.exports = router; 