const Joi = require('joi');

// Validation schema for placing a pixel
const placePixelSchema = Joi.object({
  x: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      'number.base': 'X coordinate must be a number',
      'number.integer': 'X coordinate must be an integer',
      'number.min': 'X coordinate must be at least 1',
      'number.max': 'X coordinate cannot exceed 50',
      'any.required': 'X coordinate is required',
    }),
  y: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      'number.base': 'Y coordinate must be a number',
      'number.integer': 'Y coordinate must be an integer',
      'number.min': 'Y coordinate must be at least 1',
      'number.max': 'Y coordinate cannot exceed 50',
      'any.required': 'Y coordinate is required',
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color (e.g., #FFFFFF)',
      'any.required': 'Color is required',
    }),
});

module.exports = {
  placePixelSchema,
};
