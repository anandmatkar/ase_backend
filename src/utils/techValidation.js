const Joi = require('joi');

// Validation schema for manager creation
const techLoginSchema = Joi.object({
    email: Joi.string().email().trim().required().messages({
        'any.required': 'email Address is required',
        'string.empty': 'email Address is not allowed to be empty',
        'string.email': 'email Address must be a valid email'
    }),
    password: Joi.string().trim().required().messages({
        'any.required': 'password is required',
        'string.empty': 'password is not allowed to be empty'
    }),
}).options({ allowUnknown: true });

const techChangePasswordSchema = Joi.object({
    newPassword: Joi.string().min(8).trim().required().messages({
        'any.required': 'password is required',
        'string.empty': 'password is not allowed to be empty',
        'string.min': 'password must be at least 8 characters long'
    }),
}).options({ allowUnknown: true });

const techForgetPassword = Joi.object({
    emailAddress: Joi.string().email().trim().required().messages({
        'any.required': 'email Address is required',
        'string.empty': 'email Address is not allowed to be empty',
        'string.email': 'email Address must be a valid email'
    }),
}).options({ allowUnknown: true });

const techResetPassword = Joi.object({
    emailAddress: Joi.string().email().trim().required().messages({
        'any.required': 'email Address is required',
        'string.empty': 'email Address is not allowed to be empty',
        'string.email': 'email Address must be a valid email'
    }),
    password: Joi.string().min(8).trim().required().messages({
        'any.required': 'password is required',
        'string.empty': 'password is not allowed to be empty',
        'string.min': 'password must be at least 8 characters long'
    }),
}).options({ allowUnknown: true });

const techEditTechnicianSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'Name must not be empty'
    }),
    surname: Joi.string().trim().required().messages({
        'any.required': 'Surname is required',
        'string.empty': 'Surname must not be empty'
    }),
    emailAddress: Joi.string().email().trim().required().messages({
        'any.required': 'Email address is required',
        'string.empty': 'Email address must not be empty',
        'string.email': 'Email address must be a valid email'
    }),
    phoneNumber: Joi.string().trim().required().messages({
        'any.required': 'Phone number is required',
        'string.empty': 'Phone number must not be empty'
    }),
    nationality: Joi.string().trim().required().messages({
        'any.required': 'Nationality is required',
        'string.empty': 'Nationality must not be empty'
    }),
    qualification: Joi.string().trim().required().messages({
        'any.required': 'Qualification is required',
        'string.empty': 'Qualification must not be empty'
    }),
    level: Joi.string().trim().required().messages({
        'any.required': 'Level is required',
        'string.empty': 'Level must not be empty'
    })
}).options({ allowUnknown: true });

const createTimesheetSchema = Joi.object({
    date: Joi.date().required().messages({
        'any.required': 'Date is required',
        'date.base': 'Date must be a valid ISO date format'
    }),
    startTime: Joi.string().trim().required().messages({
        'any.required': 'Start time is required',
        'string.empty': 'Start time must not be empty'
    }),
    endTime: Joi.string().trim().required().messages({
        'any.required': 'End time is required',
        'string.empty': 'End time must not be empty'
    })
}).options({ allowUnknown: true });

module.exports = {
    techLoginSchema,
    techChangePasswordSchema,
    techForgetPassword,
    techResetPassword,
    techEditTechnicianSchema,
    createTimesheetSchema
};