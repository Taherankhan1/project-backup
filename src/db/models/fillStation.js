const mongoose = require("mongoose");
const validator = require("validator");
const {
  ValidationMsgs,
  TableNames,
  TableFields,
  UserTypes,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

const FillStationSchema = new mongoose.Schema(
  {
    [TableFields.name_]: {
      type: String,
      trim: true,
      required: [true, ValidationMsgs.NameEmpty],
    },
    [TableFields.phoneNumber]: {
      type: String,
      required: [true, ValidationMsgs.PhoneNumberEmpty],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value);
        },
        message: ValidationMsgs.phoneNumberInvalid,
      },
      minlength: 10,
      maxlength: 14,
    },
    [TableFields.address]: {
      type: String,
      required: [true, ValidationMsgs.AddressEmpty],
      trim: true,
      maxlength: 255,
      lowercase: true,
    },

    [TableFields.isDeleted]: {
      type: Number,
      default: 0,
    },
    [TableFields.deletedAt]: {
      type: String,
      default: "",
    },
    [TableFields.approved]: {
      type: Boolean,
      default: false,
    },
    [TableFields.userType]: {
      type: Number,
      enum: Object.values(UserTypes),
    },

    [TableFields.createdBy]: {
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
      [TableFields.isDeleted]: {
        type: Number,
        default: 0,
      },
      [TableFields.deletedAt]: {
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

FillStationSchema.index({ [TableFields.phoneNumber]: 1 }, { unique: true });

const FillStation = mongoose.model(TableNames.FillStation, FillStationSchema);
module.exports = FillStation;
