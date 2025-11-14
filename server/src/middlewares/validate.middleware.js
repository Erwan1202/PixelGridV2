// Middleware to validate request data using Joi schemas
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown keys from the validated data
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: errorMessages,
      });
    }

    // Replace req.body with the validated and sanitized value
    req.body = value;
    next();
  };
};

module.exports = validate;
