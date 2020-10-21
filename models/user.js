'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');


module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.hasMany(models.Course, {
                foreignKey: {
                    fieldName: 'id',
                    allowNull: false
                }
            })
        }
    };
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,  
            allowNull: false,
            set(val) {

                const hashedPassword = bcrypt.hashSync(val, 10);
                this.setDataValue('password', hashedPassword);
                
            },
            validate: {
                notNull: {
                    msg: 'A password is required'
                },
                notEmpty: {
                    msg: 'Please provide a password'
                },
                // len: {
                //     args: [8, 20],
                //     msg: 'The password should be between 8 and 20 characters in length'
                // }
            }
        },
        // confirmedPassword: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     set(val) {
        //         if( val === this.password ) {
        //             const hashedPassword = bcrypt.hashSync(val, 10);
        //             this.setDataValue('password', hashedPassword);
        //         }
        //     },
        //     validate: {
        //         notNull: {
        //             msg: 'Both passwords must match'
        //         }
        //     }
        // }
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};