require("dotenv").config();
const app = require("./app");
const sequelize = require("./db");

const APP_PORT = process.env.APP_PORT || 3000;

sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log(`Server is running on http://localhost:${APP_PORT}`);
  });
});
