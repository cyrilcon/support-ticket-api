const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Request = sequelize.define(
  "Request",
  {
    topic: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("new", "in_progress", "done", "cancelled"),
      defaultValue: "new",
      allowNull: false,
    },
    solution: { type: DataTypes.TEXT },
    cancellationReason: { type: DataTypes.TEXT },
  },
  {
    timestamps: true,
  },
);

module.exports = Request;
