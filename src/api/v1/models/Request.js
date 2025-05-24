import { DataTypes, Model } from "sequelize";
import sequelize from "../../../db.js";
import RequestStatus from "../constants/requestStatus.js";

class Request extends Model {}

Request.init(
  {
    topic: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM(
        RequestStatus.NEW,
        RequestStatus.IN_PROGRESS,
        RequestStatus.DONE,
        RequestStatus.CANCELLED,
      ),
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
