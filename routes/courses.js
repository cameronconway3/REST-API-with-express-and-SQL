'use strict';

const express = require('express');
const auth = require('basic-auth');
const { authenticateUser } = require('../middleware/auth-user');
const router = express.Router();

// import Sequelize and models
const { sequelize, Course, User } = require('../models');

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
    const courses = await Course.findAll({
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        },
        include: {
            model: User,
            attributes: {
                exclude: ["password", "createdAt", "updatedAt"]
            }
        }
    });
    if(courses) {
        res.status(200).json(courses);
    } else {
        res.status(404).json({message: "Could not retrieve courses"})
    }
}));

// Returns the course (including the user that owns the course) for the provided course ID
router.get('/:id', asyncHandler(async (req, res)=> {
    const course = await Course.findOne({
        where: {
            id: req.params.id
        },
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        },
        include: {
            model: User,
            attributes: {
                exclude: ["password", "createdAt", "updatedAt"]
            }
        }
    });
    if(course) {
        res.status(200).json(course);
    } else {
        res.status(404).json({message: "Course not found."});
    }
}));

// Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/', authenticateUser, asyncHandler(async (req, res)=> {
    try {
        await Course.create(req.body);
        const course = await Course.findOne({
            where: {
                title: req.body.title
            }
        });
        res.status(201).set({
            location: `/api/courses/${course.id}`
        }).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

// Updates a course and returns no content
router.put('/:id', authenticateUser, asyncHandler(async (req, res)=> {
    const course = await Course.findByPk(req.params.id);
    if(course) {

        // Check that the user requesting owns the course
        // Get the authenticated user 
        const credentials = auth(req);
        const authUser = await User.findOne({
            where: {
                emailAddress: credentials.name
            }
        })

        // Get the id of tje user trying to make the request
        const authenticatedUserId = authUser.id;

        // If the user requesting the course is not equal to the courses userId then return a 403
        if(authenticatedUserId == course.userId) {
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
            res.status(403).json({ message: "User doesn't own the requested course" })
        }
    } else {
        res.status(404).json({message: "Course not found."});
    }
}));

// Deletes a course and returns no content
router.delete("/:id", authenticateUser, asyncHandler(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    if(course) {
        // Check that the user requesting owns the course
        // Get the authenticated user 
        const credentials = auth(req);
        const authUser = await User.findOne({
            where: {
                emailAddress: credentials.name
            }
        });

        // Get the id of the user trying to make the request
        const authenticatedUserId = authUser.id;

        // If the user requesting the course is not equal to the courses userId then return a 403
        if(authenticatedUserId == course.userId) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(403).json({ message: "User doesn't own the requested course" })
        }
    } else {
        res.status(404).json({message: "Course not found."});
    }
}));

module.exports = router; 