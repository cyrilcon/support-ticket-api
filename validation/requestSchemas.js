const Joi = require("joi");

const createRequestSchema = Joi.object({
  topic: Joi.string().required(),
  text: Joi.string().required(),
});

const completeRequestSchema = Joi.object({
  solution: Joi.string().required(),
});

const cancelRequestSchema = Joi.object({
  reason: Joi.string().required(),
});

const dateFilterSchema = Joi.object({
  date: Joi.string().isoDate(),
  from: Joi.string().isoDate(),
  to: Joi.string().isoDate(),
});

module.exports = {
  createRequestSchema,
  completeRequestSchema,
  cancelRequestSchema,
  dateFilterSchema,
};
