const express = require("express");
const Request = require("../models/request");
const Joi = require("joi");

const router = express.Router();

const schema = Joi.object({
  topic: Joi.string().required(),
  text: Joi.string().required(),
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const request = await Request.create(value);
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error:", err });
  }
});

module.exports = router;
