import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";

class Request extends Model {}

Request.init(
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
    sequelize,
    modelName: "Request",
    tableName: "requests",
    timestamps: true,
  },
);

export default Request;
