import { Op } from "sequelize";
import {
  cancelRequestSchema,
  completeRequestSchema,
  createRequestSchema,
  dateFilterSchema,
} from "../validation/requestSchemas.js";
import Request from "../models/Request.js";
import RequestStatus from "../constants/requestStatus.js";

/**
 * Creates a new anonymous support request.
 *
 * Expects `topic` and `text` in the request body.
 * Returns the created request with status 201.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 */
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

/**
 * Marks an existing request as "in_progress".
 *
 * Looks up the request by ID from the URL path.
 * Returns 404 if not found.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const postTakeRequestHandler = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ error: `Request with ID ${req.params.id} not found` });
    }

    request.status = RequestStatus.IN_PROGRESS;
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

/**
 * Completes a request by setting its status to "done"
 * and saving the provided solution text.
 *
 * Expects `solution` in the request body.
 * Returns 404 if the request is not found.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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

    request.status = RequestStatus.DONE;
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

/**
 * Cancels a specific request with a given reason.
 *
 * Expects `reason` in the request body.
 * Returns 404 if the request is not found.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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

    request.status = RequestStatus.CANCELLED;
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

/**
 * Retrieves all requests, optionally filtered by:
 * - a specific date (`date`)
 * - a date range (`from`, `to`)
 *
 * Query parameters are validated. If no filter is applied, all records are returned.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
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

/**
 * Cancels all requests that are currently in "in_progress" status.
 *
 * Performs a bulk update and returns the number of affected rows
 * along with the updated records.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const postCancelAllRequestsHandler = async (req, res) => {
  try {
    const [cancelledCount, cancelledRequests] = await Request.update(
      { status: RequestStatus.CANCELLED },
      {
        where: { status: RequestStatus.IN_PROGRESS },
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
