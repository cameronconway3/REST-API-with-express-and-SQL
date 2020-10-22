'use-strict';

const auth = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.authenticateUser = async (req, res, next) => {

    let message;

    // Use the auth() method to parse the user's credentials from the Authorization header, assign them to the variable 'credentials'
    // Assuming that the request contains a valid Basic Authentication Authorization header value, the credentials variable will be set to an object containing the user's key and secret (their username and password).
    const credentials = auth(req);
    const username = credentials.name;
    const pass = credentials.pass;

    console.log(credentials)

     // If credentials are available
    if (credentials) {
        const user = await User.findOne({ where: {username: credentials.name} });

        if (user) {
            // use the bcrypt compareSync() method to compare the user's password (from the Authorization header) to the encrypted password retrieved from the database.
            const authenticated = bcrypt.compareSync(credentials.pass, user.confirmedPassword);

            // If the passwords match
            if (authenticated) {
                console.log(`Authentication successful for username: ${user.username}`);

                // Store the user on the Request object.
                // req.currentUser means that you're adding a property named currentUser to the request object and setting it to the authenticated user.
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.username}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        // Passes exection to the next middleware
        next();
    }

}

