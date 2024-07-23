const Joi = require('joi');

// Joi schema for video URL validation
const videoSchema = Joi.object({
  url: Joi.string().uri().required(),
  public_Id: Joi.string().required(),
});

module.exports = videoSchema;
