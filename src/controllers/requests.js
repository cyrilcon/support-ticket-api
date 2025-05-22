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
    res.status(500).json({ error: "Internal server error:", err });
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
    res.status(500).json({ error: "Internal server error:", err });
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
    res.status(500).json({ error: "Internal server error:", err });
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
    res.status(500).json({ error: "Internal server error:", err });
  }
};

export const getRequestByDateHandler = async (req, res) => {
  try {
    const { error, value } = dateFilterSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, from, to } = value;
    let where = {};

    if (date) {
      const parsedDate = new Date(date);
      const nextDay = new Date(parsedDate);
      nextDay.setDate(parsedDate.getDate() + 1);

      where.createdAt = {
        [require("sequelize").Op.gte]: parsedDate,
        [require("sequelize").Op.lt]: nextDay,
      };
    } else if (from && to) {
      where.createdAt = {
        [require("sequelize").Op.between]: [new Date(from), new Date(to)],
      };
    }

    const requests = await Request.findAll({ where });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error:", err });
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
    res.status(500).json({ error: "Internal server error:", err });
  }
};
