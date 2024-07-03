const mongoose = require("mongoose");
const validator = require("validator");
const {
  ValidationMsgs,
  TableNames,
  TableFields,
  UserTypes,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

const CylinderHistorySchema = new mongoose.Schema(
{
    [TableFields.cylinderId]: {
        type: String,
        trim: true,
      },
      [TableFields.stationId]: {
        type: String,
        trim: true,
      },
      [TableFields.firefighterId]: {
        type: String,
        trim: true,
      },
  
      [TableFields.assignDate]: {
        type: Date ,
        trim: true,
      },
  
      [TableFields.unassignDate]: {
        type: Date,
        trim: true,
      },
},
{
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
  }

);

const CylinderHistory = mongoose.model(TableNames.CylinderHistory, CylinderHistorySchema);
module.exports = CylinderHistory;

