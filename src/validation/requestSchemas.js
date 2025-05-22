import Joi from "joi";

export const createRequestSchema = Joi.object({
  topic: Joi.string().required(),
  text: Joi.string().required(),
});

export const completeRequestSchema = Joi.object({
  solution: Joi.string().required(),
});

export const cancelRequestSchema = Joi.object({
  reason: Joi.string().required(),
});

export const dateFilterSchema = Joi.object({
  date: Joi.string().isoDate(),
  from: Joi.string().isoDate(),
  to: Joi.string().isoDate(),
});
