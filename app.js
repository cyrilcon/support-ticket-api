const express = require("express");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

app.use(express.json());
app.use("/requests", requestRoutes);

module.exports = app;
