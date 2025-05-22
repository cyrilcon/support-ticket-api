import express from "express";
import {
  getRequestByDateHandler,
  postCancelAllRequestsHandler,
  postCancelSingleRequestHandler,
  postCompleteRequestHandler,
  postRequestHandler,
  postTakeRequestHandler,
} from "../controllers/requests.js";

const router = express.Router();

router.post("/", postRequestHandler);
router.post("/:id/take", postTakeRequestHandler);
router.post("/:id/complete", postCompleteRequestHandler);
router.post("/:id/cancel", postCancelSingleRequestHandler);
router.get("/", getRequestByDateHandler);
router.post("/cancel", postCancelAllRequestsHandler);

export default router;
