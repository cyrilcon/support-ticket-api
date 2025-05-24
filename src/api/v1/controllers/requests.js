import { Op } from "sequelize";
import {
  cancelRequestSchema,
  completeRequestSchema,
  createRequestSchema,
  dateFilterSchema,
} from "../validation/requestSchemas.js";
import Request from "../models/Request.js";

export const postRequestHandler = async (req, res) => {
  try {
    const { error, value } = createRequestSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const request = await Request.create(value);
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export const postTakeRequestHandler = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ error: `Request with ID ${req.params.id} not found` });
    }

    request.status = "in_progress";
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export const postCompleteRequestHandler = async (req, res) => {
  try {
    const { error, value } = completeRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ error: `Request with ID ${req.params.id} not found` });
    }

    request.status = "done";
    request.solution = value.solution;
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export const postCancelSingleRequestHandler = async (req, res) => {
  try {
    const { error, value } = cancelRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ error: `Request with ID ${req.params.id} not found` });
    }

    request.status = "cancelled";
    request.cancellationReason = value.reason;
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export const getRequestByDateHandler = async (req, res) => {
  try {
    const { error, value } = dateFilterSchema.validate(req.query);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, from, to } = value;
    const where = {};

    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      where.createdAt = {
        [Op.gte]: date,
        [Op.lt]: nextDay,
      };
    } else {
      const createdAt = {};

      if (from) {
        createdAt[Op.gte] = from;
      }

      if (to) {
        createdAt[Op.lte] = to;
      }

      if (Reflect.ownKeys(createdAt).length > 0) {
        where.createdAt = createdAt;
      }
    }

    const requests = await Request.findAll({ where });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export const postCancelAllRequestsHandler = async (req, res) => {
  try {
    const [cancelledCount, cancelledRequests] = await Request.update(
      { status: "cancelled" },
      {
        where: { status: "in_progress" },
        returning: true,
      },
    );

    res.json({ cancelledCount, cancelledRequests });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};
