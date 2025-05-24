import express from "express";
import morgan from "morgan";
import cors from "cors";
import v1Routes from "./api/v1/routes/index.js";

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use("/api/v1", v1Routes);
app.use(cors());

export default app;
