import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./db.js";

dotenv.config();

const APP_PORT = process.env.APP_PORT || 3000;

sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log(`Server was started on port ${APP_PORT}`);
  });
});
