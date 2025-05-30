import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const DB_NAME = process.env.DB_NAME || "support_ticket";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
const DB_HOST = process.env.DB_HOST || "support_ticket_postgres";
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
});

export default sequelize;
