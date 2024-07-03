const mongoose = require("mongoose");
const validator = require("validator");
const {
  ValidationMsgs,
  TableNames,
  TableFields,
  cylinderDefault_capacity
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

const CylinderSchema = new mongoose.Schema(
    
    {
        [TableFields.serialNo]: {
            type: Number,
            required: [true, ValidationMsgs.serialNoEmpty],
            trim: true,
            unique: true,
            lowercase: true,
          },
        [TableFields.mfgDate]: {
            type: Date,
            trim: true,
          },
        [TableFields.expDate]: {
            type: Date,
            trim: true,
          },
        [TableFields.expDate]: {
            type: Date,
            trim: true,
          },
          [TableFields.inUse]: {
            type: Boolean,
            trim: true,
            default: false,
          },
          [TableFields.maxCapacity]: {
            type: Number,
            default: cylinderDefault_capacity,
          },
          [TableFields.remainingCapacity]: {
            type: Number,
            default: cylinderDefault_capacity,
          },
          [TableFields.isDeleted]: {
            type: Number,
            default: 0,
          },
          [TableFields.deletedAt]: {
            type: String,
            trim: true
          },
          [TableFields.createdBy]:{
            [TableFields.ID]: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TableNames.FillStation,
              },
              [TableFields.name_]: {
                type: String,
                trim: true,
              },
              [TableFields.phoneNumber]: {
                type: Number,
                trim: true,
              },
              [TableFields.isDeleted]:{
                type: Number,
                default: 0,
              },
              [TableFields.deletedAt]:{
                type: String,
                default: "",
              },
        },

        [TableFields.fireFighter]:{
            [TableFields.ID]: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TableNames.FireFighter,
              },
              [TableFields.name_]: {
                type: String,
                trim: true,
              },
              [TableFields.email]: {
                type: String,
                trim: true,
              },
              [TableFields.isDeleted]:{
                type: Number,
                default: 0,
              },
              [TableFields.deletedAt]:{
                type: String,
                default: "",
              },    
        },
        [TableFields.department]:{
            [TableFields.ID]: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TableNames.Department,
              },
              [TableFields.name_]: {
                type: String,
                trim: true,
              },
              [TableFields.email]: {
                type: String,
                trim: true,
              },
              [TableFields.isDeleted]:{
                type: Number,
                default: 0,
              },
              [TableFields.deletedAt]:{
                type: String,
                default: "",
              },    
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

CylinderSchema.index({ [TableFields.serialNo]: 1 }, { unique: true });

const Cylinder = mongoose.model(TableNames.Cylinder, CylinderSchema);
module.exports = Cylinder;
