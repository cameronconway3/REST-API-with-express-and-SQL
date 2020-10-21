'use strict';

const express = require('express');
const router = express.Router();

// import Sequelize and models
const { sequelize, Course } = require('../models');

function asyncHandler(cb){
    return async (req,res, next) => {
        try {
            await cb(req, res, next);
        } catch(err) {
            next(err);
        }
    }
};

// Returns a list of courses (including the user that owns each course)
router.get('/', asyncHandler(async (req, res)=> {
    const courses = await Course.findAll();
    if(courses) {
        res.status(200).json(courses);
    } else {
        res.status(404).json({message: "Could not retrieve courses"})
    }
}));

// Returns the course (including the user that owns the course) for the provided course ID
router.get('/:id', asyncHandler(async (req, res)=> {
    const course = await Course.findByPk(req.params.id);
    if(course) {
        res.status(200).json(course);
    } else {
        res.status(404).json({message: "Course not found."});
    }
}));

// Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/', asyncHandler(async (req, res)=> {
    try {
        await Course.create(req.body);
        res.status(201).json({message: "Course successfully created"})
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

//update body
function updateFields(field) {

}

// Updates a course and returns no content
router.put('/:id', asyncHandler(async (req, res)=> {
    const course = await Course.findByPk(req.params.id);
    if(course) {
        // Look through the attributes in Course, if the attribute (field) is not id, createdAt, or updatedAt then push to 'availableFields'
        let availableFields = [];
        for (let field in Course.rawAttributes) {
            if(field !== 'id' && field !== 'createdAt' && field !== 'updatedAt') {
                availableFields.push(field)
            }
        }

        // Loop through the fields being passed via req.body and add ach one to 'requestFields'
        let requestFields = []
        for (let key in req.body) {
            requestFields.push(key)
        }

        // Check every field in requestFields against availableFields, if all values in requestedFields are included in availableFields update the Course modal
        // with the relative data passed in the req.body
        // Else throw an error indicating that the user has passed an invalid argument into the request
        if( requestFields.every(x => availableFields.includes(x)) ) {
            for (let key in req.body) {
                course[key] = req.body[key]
            }
        } else {
            const err = new Error('Invalid argument passed')
            throw err;
        }

        await course.save();
        res.status(204).end();

    } else {
        res.status(404).json({message: "Course not found."});
    }
}));

// Deletes a course and returns no content
router.delete("/:id", asyncHandler(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
}));

module.exports = router; 