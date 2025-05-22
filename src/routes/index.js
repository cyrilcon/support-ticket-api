import express from "express";
import requestRoutes from "./requests.js";

const router = express.Router();

router.use("/requests", requestRoutes);

export default router;
