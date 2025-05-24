import express from "express";
import morgan from "morgan";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use(router);
app.use(cors());

export default app;
