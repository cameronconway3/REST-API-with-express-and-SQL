'use-strict';

const auth = require('basic-auth');
const { User, Course } = require('../models');
const bcrypt = require('bcryptjs');

exports.authenticateUser = async (req, res, next) => {
    try {
        // get the name and pass credentials and assign to 'username' and 'password' respectively
        const credentials = auth(req);
        const username = credentials.name;
        const password = credentials.pass;

        // Find user where 'emailAddress' is equal to 'username'
        const user = await User.findOne({
            where: {
                emailAddress: username
            }
        })
        // If the user is defined, compare the bcrypted password with the password passed in 'credentials'
        // If authenticated is true, pass req.user as user
        if(user) {
            const authenticated = bcrypt.compareSync(password, user.password);
            if(authenticated) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ message: 'Wrong password' });
            }
        } else {
            res.status(401).json({ message: 'User not found' });
        }
        
    } catch(error) {
        res.status(401).json({message: 'Unauthorized'});
    }
}

