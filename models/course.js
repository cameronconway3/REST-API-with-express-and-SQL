'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Course extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Course belongs to many users
            Course.belongsTo(models.User, {
                foreignKey: {
                    fieldName: 'userId',
                    allowNull: false,
                    validate: {
                        notNull: {
                            msg: "Please provide a userId."
                        },
                        notEmpty: {
                            msg: "UserId is required."
                        }
                    }
                }
            })
        }
    };
    Course.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a title."
                },
                notEmpty: {
                    msg: "A title is required."
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please provide a description."
                },
                notEmpty: {
                    msg: "Description is required."
                }
            }
        },
        estimatedTime: {
            type: DataTypes.STRING,
            allowNull: true
        },
        materialsNeeded: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
        {
            sequelize,
            modelName: 'Course',
        });
    return Course;
};