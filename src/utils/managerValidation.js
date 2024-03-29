const Joi = require('joi');

// Validation schema for manager creation
const managerCreationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'name is required',
        'string.empty': 'name is not allowed to be empty'
    }),
    surname: Joi.string().trim().required().messages({
        'any.required': 'surname is required',
        'string.empty': 'surname is not allowed to be empty'
    }),
    company: Joi.string().trim().required().messages({
        'any.required': 'company is required',
        'string.empty': 'company is not allowed to be empty'
    }),
    position: Joi.string().valid('Manager').trim().required().messages({
        'any.only': 'position must be "Manager"',
        'any.required': 'position is required',
        'string.empty': 'position is not allowed to be empty'
    }),
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
    phone: Joi.string().pattern(new RegExp(/^[0-9]{10}$/)).trim().required().messages({
        'any.required': 'phone is required',
        'string.empty': 'phone is not allowed to be empty',
        'string.pattern.base': 'phone must be a valid phone number'
    })
}).options({ allowUnknown: true });

const verifyManagerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email must not be empty',
        'string.email': 'Email must be a valid email address'
    }),
    otp: Joi.alternatives().try(Joi.string().pattern(new RegExp(/^[0-9]{4}$/)), Joi.number().integer()).required().messages({
        'any.required': 'OTP is required',
        'string.empty': 'OTP must not be empty',
        'string.pattern.base': 'OTP must be a 4-digit number',
        'number.base': 'OTP must be a number'
    })
});

const updateManagerSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'name is required',
        'string.empty': 'name is not allowed to be empty'
    }),
    surname: Joi.string().trim().required().messages({
        'any.required': 'surname is required',
        'string.empty': 'surname is not allowed to be empty'
    }),
    email_address: Joi.string().email().trim().required().messages({
        'any.required': 'email Address is required',
        'string.empty': 'email Address is not allowed to be empty',
        'string.email': 'email Address must be a valid email'
    }),
    phone_number: Joi.string().pattern(new RegExp(/^[0-9]{10}$/)).trim().required().messages({
        'any.required': 'phone is required',
        'string.empty': 'phone is not allowed to be empty',
        'string.pattern.base': 'phone must be a valid phone number'
    })
}).options({ allowUnknown: true });

const managerChangePasswordSchema = Joi.object({
    newPassword: Joi.string().min(8).trim().required().messages({
        'any.required': 'password is required',
        'string.empty': 'password is not allowed to be empty',
        'string.min': 'password must be at least 8 characters long'
    }),
}).options({ allowUnknown: true });

const editTechnicianSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Name is required',
        'string.empty': 'Name must not be empty'
    }),
    surname: Joi.string().trim().required().messages({
        'any.required': 'Surname is required',
        'string.empty': 'Surname must not be empty'
    }),
    email_address: Joi.string().email().trim().required().messages({
        'any.required': 'Email address is required',
        'string.empty': 'Email address must not be empty',
        'string.email': 'Email address must be a valid email'
    }),
    phone_number: Joi.string().trim().required().messages({
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

// Validation schema for createTechnician
const createTechnicianSchema = Joi.object({
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
    password: Joi.string().min(8).trim().required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password must not be empty',
        'string.min': 'Password must be at least 8 characters long'
    }),
    phone: Joi.string().trim().required().messages({
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

const createProjectSchema = Joi.object({
    customerId: Joi.string().uuid().required().messages({
        'any.required': 'Customer ID is required',
        'string.empty': 'Customer ID must not be empty',
        'string.guid': 'Customer ID must be a valid UUID'
    }),
    projectType: Joi.string().trim().required().messages({
        'any.required': 'Project type is required',
        'string.empty': 'Project type must not be empty'
    }),
    description: Joi.string().trim().required().messages({
        'any.required': 'Description is required',
        'string.empty': 'Description must not be empty'
    }),
    startDate: Joi.date().required().messages({
        'any.required': 'Start date is required',
        'date.base': 'Start date must be a valid date format'
    }),
    endDate: Joi.date().required().messages({
        'any.required': 'End date is required',
        'date.base': 'End date must be a valid date format'
    }),

}).options({ allowUnknown: true });

const editProjectSchema = Joi.object({
    projectId: Joi.string().uuid().required().messages({
        'any.required': 'Project ID is required',
        'string.empty': 'Project ID must not be empty',
        'string.guid': 'Project ID must be a valid UUID'
    }),
    projectType: Joi.string().trim().required().messages({
        'any.required': 'Project type is required',
        'string.empty': 'Project type must not be empty'
    }),
    description: Joi.string().trim().required().messages({
        'any.required': 'Description is required',
        'string.empty': 'Description must not be empty'
    }),
    startDate: Joi.date().required().messages({
        'any.required': 'Start date is required',
        'date.base': 'Start date must be a valid date format'
    }),
    endDate: Joi.date().required().messages({
        'any.required': 'End date is required',
        'date.base': 'End date must be a valid date format'
    }),

}).options({ allowUnknown: true });

const editMachineSchema = Joi.object({
    machine_id: Joi.string().uuid().required().messages({
        'any.required': 'machine ID is required',
        'string.empty': 'machine ID must not be empty',
        'string.guid': 'machine ID must be a valid UUID'
    }),
    machine_type: Joi.string().trim().required().messages({
        'any.required': 'Machine type is required',
        'string.empty': 'Machine type must not be empty'
    }),
    description: Joi.string().trim().required().messages({
        'any.required': 'Description is required',
        'string.empty': 'Description must not be empty'
    }),
    serial: Joi.string().trim().required().messages({
        'any.required': 'Serial is required',
        'string.empty': 'Serial must not be empty'
    }),
    hour_count: Joi.string().trim().required().messages({
        'any.required': 'Hour count is required',
        'string.empty': 'Hour count must not be empty'
    }),
    nom_speed: Joi.string().trim().required().messages({
        'any.required': 'Nominal speed is required',
        'string.empty': 'Nominal speed must not be empty'
    }),
    act_speed: Joi.string().trim().required().messages({
        'any.required': 'Actual speed is required',
        'string.empty': 'Actual speed must not be empty'
    })

}).options({ allowUnknown: true });

const createCustomerSchema = Joi.object({
    customerName: Joi.string().trim().required().messages({
        'any.required': 'Customer name is required',
        'string.empty': 'Customer name must not be empty'
    }),
    customerContactName: Joi.string().trim().required().messages({
        'any.required': 'Customer contact name is required',
        'string.empty': 'Customer contact name must not be empty'
    }),
    customerAccount: Joi.string().trim().required().messages({
        'any.required': 'Customer account is required',
        'string.empty': 'Customer account must not be empty'
    }),
    email: Joi.string().email().trim().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email must not be empty',
        'string.email': 'Email must be a valid email address'
    }),
    phone: Joi.string().trim().required().messages({
        'any.required': 'Phone is required',
        'string.empty': 'Phone must not be empty'
    }),
    country: Joi.string().trim().required().messages({
        'any.required': 'Country is required',
        'string.empty': 'Country must not be empty'
    }),
    city: Joi.string().trim().required().messages({
        'any.required': 'City is required',
        'string.empty': 'City must not be empty'
    }),
    address: Joi.string().trim().required().messages({
        'any.required': 'Address is required',
        'string.empty': 'Address must not be empty'
    }),
    scopeOfWork: Joi.string().trim().required().messages({
        'any.required': 'Scope of work is required',
        'string.empty': 'Scope of work must not be empty'
    })
}).options({ allowUnknown: true });

const updateCustomerSchema = Joi.object({
    customer_id: Joi.string().uuid().required().messages({
        'any.required': 'Customer ID is required',
        'string.empty': 'Customer ID must not be empty',
        'string.guid': 'Customer ID must be a valid UUID'
    }),
    customer_name: Joi.string().trim().required().messages({
        'any.required': 'Customer name is required',
        'string.empty': 'Customer name must not be empty'
    }),
    customer_contact: Joi.string().trim().required().messages({
        'any.required': 'Customer contact is required',
        'string.empty': 'Customer contact must not be empty'
    }),
    customer_account: Joi.string().trim().required().messages({
        'any.required': 'Customer account is required',
        'string.empty': 'Customer account must not be empty'
    }),
    email_address: Joi.string().email().trim().required().messages({
        'any.required': 'Email address is required',
        'string.empty': 'Email address must not be empty',
        'string.email': 'Email address must be a valid email'
    }),
    phone_number: Joi.string().trim().required().messages({
        'any.required': 'Phone number is required',
        'string.empty': 'Phone number must not be empty'
    }),
    country: Joi.string().trim().required().messages({
        'any.required': 'Country is required',
        'string.empty': 'Country must not be empty'
    }),
    city: Joi.string().trim().required().messages({
        'any.required': 'City is required',
        'string.empty': 'City must not be empty'
    }),
    address: Joi.string().trim().required().messages({
        'any.required': 'Address is required',
        'string.empty': 'Address must not be empty'
    }),
    scope_of_work: Joi.string().trim().required().messages({
        'any.required': 'Scope of work is required',
        'string.empty': 'Scope of work must not be empty'
    })
}).options({ allowUnknown: true });

module.exports = {
    managerCreationSchema,
    verifyManagerSchema,
    updateManagerSchema,
    managerChangePasswordSchema,
    editTechnicianSchema,
    createTechnicianSchema,
    createProjectSchema,
    editProjectSchema,
    editMachineSchema,
    createCustomerSchema,
    updateCustomerSchema
};
