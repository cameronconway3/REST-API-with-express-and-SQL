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
    const user = await User.findOne({
        where: {
          id: req.user.id
        },
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"]
        }
      });
      res.status(200).json(user);
}));

// Creates a user, sets the Location header to "/", and returns no content
router.post('/', asyncHandler(async (req, res)=> {
    try {
        // Check that email isn't already taken
        const userDuplicateEmail = await User.findOne({
            where: {
                emailAddress: req.body.emailAddress
            }
        })

        // If the email has already been taken return a 409 error (Conflict)
        if(userDuplicateEmail) {
            res.status(409).json({message: "This email address has already been taken"})
        } else {
            await User.create(req.body);
            res.status(201).set({
                location: "/"
            }).end();
        }

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