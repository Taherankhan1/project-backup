const mongoose = require("mongoose");
const validator = require("validator");
const {
  ValidationMsgs,
  TableNames,
  TableFields,
  UserTypes,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const bcrypt = require("bcryptjs"); // To compare value with it's Hash
const jwt = require("jsonwebtoken"); // To generate Hash

const departmentSchema = new mongoose.Schema(

    {
    [TableFields.name_]: {
      type: String,
      trim: true,
      required: [true, ValidationMsgs.NameEmpty],
    },

    [TableFields.email]: {
      type: String,
      required: [true, ValidationMsgs.EmailEmpty],
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) { 
        if (!validator.isEmail(value)) {
          throw new ValidationError(ValidationMsgs.EmailInvalid);
        }
      },
    },
    [TableFields.phoneNumber]: {
        type: String,
        required: [true, ValidationMsgs.PhoneNumberEmpty],
        unique:true,
        trim: true,
        validate: {
          validator: function(value) {
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

    [TableFields.password]: {
      type: String,
      minlength: 8,
      trim: true,
      require: [true, ValidationMsgs.PasswordEmpty],
    },
    [TableFields.isDeleted]: {
      type: Number,
      default: 0,
    },
    [TableFields.deletedAt]: {
      type: String,
      default: "",
    },
    [TableFields.tokens]: [
      {
        _id: false,
        [TableFields.token]: {
          type: String,
        },
      },
    ],
    [TableFields.approved]: {
      type: Boolean,
      default: false,
    },
    [TableFields.userType]: {
      type: Number,
      enum: Object.values(UserTypes),
    },
    [TableFields.passwordResetToken]: {
      type: String,
      trim: true,
    },
    

    [TableFields.createdBy]:{
        [TableFields.ID]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Admin,
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
        delete ret[TableFields.passwordResetToken];
        delete ret[TableFields.password];
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
  }
);


departmentSchema.methods.isValidAuth = async function (password) {
  return await bcrypt.compare(password, this.password);
};

departmentSchema.methods.isValidPassword = function (password) {
  const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regEx.test(password);
};

departmentSchema.methods.createAuthToken = function () {
  const token = jwt.sign(
    {
      [TableFields.ID]: this[TableFields.ID].toString(),
    },
    process.env.JWT_DEPT_PK
  );
  return token;
};

//Hash the plaintext password before saving
departmentSchema.pre("save", async function (next) {
  if (this.isModified(TableFields.password)) {
    this[TableFields.password] = await bcrypt.hash(
      this[TableFields.password],
      8
    ); // 8 = number of rounds of encryption
  }
  next();
});

departmentSchema.index({ [TableFields.email]: 1 }, { unique: true });

const Department = mongoose.model(TableNames.Department, departmentSchema);
module.exports = Department;
