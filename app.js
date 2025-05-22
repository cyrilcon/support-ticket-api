import express from "express";
import requestRoutes from "./routes/requests.js";

const app = express();

app.use(express.json());
app.use("/requests", requestRoutes);

export default app;
