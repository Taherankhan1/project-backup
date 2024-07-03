const {
  TableFields,
  ValidationMsgs,
  UserTypes,
  TableNames,
  GeneralMsgs
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Admin = require("../models/admin");
const FireFighter= require("../models/fireFighter");
const FillStation=require("../models/fillStation");
const Cylinder=require("../models/cylinder")
const FillStationService=require("../services/FillStationService");
class AdminService {
    
  static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne({ [TableFields.email]:email ,[TableFields.isDeleted]:0}, this);
    });
  };

  static existsWithEmail = async (email, exceptionId) => {
    return await Admin.exists({
      [TableFields.email]: email,
      ...(exceptionId
        ? {
            [TableFields.ID]: { $ne: exceptionId },
          }
        : {}),
    });
  };

  static generateOTPCode = () => {
    return Util.GenerateRandomSerialno(4);
  };

  static getResetPasswordToken = async (email) => {
    let user = await AdminService.findByEmail(email)
    .withId()
    .withPasswordResetToken()
    .execute();
    if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);

    let code;
    if (!user[TableFields.passwordResetToken]) {
      code = AdminService.generateOTPCode();
      user[TableFields.passwordResetToken] = code;
      await user.save();
    } else code = user[TableFields.passwordResetToken];
    return {
      code,
      email: user[TableFields.email],
      name: user[TableFields.name_],
    };
  };

  static resetPassword = async (email, code, newPassword) => {
    let user = await AdminService.findByEmail(email)
      .withPasswordResetToken()
      .execute();
    if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);

    if (!user.isValidPassword(newPassword))
      throw new ValidationError(ValidationMsgs.PasswordInvalid);

    if (user[TableFields.passwordResetToken] == code) {
      user[TableFields.password] = newPassword;
      user[TableFields.passwordResetToken] = "";
      user[TableFields.tokens] = [];
       await user.save();
    } else throw new ValidationError(ValidationMsgs.InvalidPassResetCode);
  };

  static insertAdminRecord = async (reqBody) => {
    let email = reqBody[TableFields.email];
    let name = reqBody[TableFields.name_];
    email = (email + "").trim().toLocaleLowerCase();
    const password = reqBody[TableFields.password];
    if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);
    if (email == password)
      throw new ValidationError(ValidationMsgs.PasswordInvalid);

    if (await AdminService.existsWithEmail(email))
      throw new ValidationError(ValidationMsgs.DuplicateEmail);

    const user = new Admin(reqBody);
    user[TableFields.approved] = true;
    user[TableFields.userType] = UserTypes.Admin;
    if (!user.isValidPassword(password)) {
      throw new ValidationError(ValidationMsgs.PasswordInvalid);
    }
    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code == 11000) {
        //Mongoose duplicate email error
        throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
      }
      throw error;
    }
  };

  static saveAuthToken = async (userId, token) => {
    await Admin.updateOne(
      {
        [TableFields.ID]: userId,
      },
      {
        $push: {
          [TableFields.tokens]: { [TableFields.token]: token },
        },
      }
    );
  };

  static getUserByIdAndToken = (userId, token) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne(
        {
          [TableFields.ID]: userId,
          [TableFields.tokens + "." + TableFields.token]: token,
        }, 
        this
      );
    });
  };
  
  static getUserByToken = (token) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne(
        {
          [TableFields.tokens + "." + TableFields.token]: token,
        },
        this
      );
    });
  };
  
  static getUserById = (userId) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne(
        {
          [TableFields.ID]: userId
        },
        this
      );
    });
  };

  static removeAuth = async (adminId, authToken) => {
    await Admin.updateOne(
      {
        [TableFields.ID]: adminId,
      },
      {
        $pull: {
          [TableFields.tokens]: { [TableFields.token]: authToken },
        },
      }
    );
  };

  static updatePassword = async (
    userObj,
    newPassword,
  ) => {
    userObj[TableFields.password] = newPassword; // It will be hashed by Schema methods (pre hook 'save')
    await userObj.save();
  };

  static deleteMyReferences = async ( cascadeDeleteMethodReference, tableName, ...referenceId) => {
   
    let records = undefined;
    switch (tableName) {
      case TableNames.Admin:
        records = await Admin.find(
          {
            [TableFields.ID]: { $in: referenceId },
          },
          { [TableFields.ID]: 1 }
        );
       
        break;
    }
      if (records && records.length > 0) {
       let deleteRecordIds = records.map((a) => a[TableFields.ID]);
        await Admin.deleteMany({
            [TableFields.ID]: { $in: deleteRecordIds },
       });
      
      if (tableName != TableNames.Admin) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Admin,
          ...deleteRecordIds
        ); //So, let's remove references which points to this model
      }
    }
  };

  static insertFireFighterRecord = async (reqBody, req,password,department) => {
    let email = reqBody[TableFields.email];
    let name = reqBody[TableFields.name_];
    email = (email + "").trim().toLocaleLowerCase();
    if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);
    if (email == password) throw new ValidationError(ValidationMsgs.PasswordInvalid);

    // if (await FireFighterService.existsWithEmail(email)) throw new ValidationError(ValidationMsgs.DuplicateEmail);

    const user = new FireFighter({
      ...reqBody,
      [TableFields.approved]: true,
      [TableFields.userType]: UserTypes.FireFighter,
      [TableFields.password]: password,
      [TableFields.createdBy]: {
        [TableFields.ID]: department._id,
        [TableFields.name_]: department.name,
        [TableFields.email]: department.email,
      },
    });

    if (!user.isValidPassword(password)) {
      throw new ValidationError(ValidationMsgs.PasswordInvalid);
    }
    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code == 11000) {
        //Mongoose duplicate email error
        throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
      }
      throw error;
    }
};

static insertFillStationRecord = async (reqBody, department) => {
    let name = reqBody[TableFields.name_];
    let phoneNumber = reqBody[TableFields.phoneNumber];

    if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
    if (!phoneNumber) throw new ValidationError(ValidationMsgs.PhoneNumberEmpty);

    const fillStation = new FillStation({
      ...reqBody,
      [TableFields.approved]: true,
      [TableFields.userType]: UserTypes.FillStation,
      [TableFields.createdBy]: {
        [TableFields.ID]: department._id,
        [TableFields.name_]:department.name,
        [TableFields.email]: department.email,
      },
    });

    try {
      await fillStation.save();
    } catch (error) {
        if (error.code == 11000) {
            //Mongoose duplicate email error
            throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
          }
      throw error;
    }
  };

  static insertCylinderRecord = (reqBody, department) => {
    return new ProjectionBuilder(async function () {
        let quantity = parseInt(reqBody[TableFields.quantity]); 
        if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
          throw new ValidationError(ValidationMsgs.InvalidQuantity);
        }  
       
    const fillStationId = reqBody[TableFields.stationId];
    if (!fillStationId) throw new ValidationError(ValidationMsgs.StationIdEmpty);

    const fillstation = await FillStationService.getFillStationById(fillStationId)
      .withBasicInfo()
      .withPhone()
      .execute();
     if (!fillstation) {
        throw new ValidationError(GeneralMsgs.StatioNotFound);
     }

    const cylinders = [];
    for (let i = 0; i < quantity; i++) {
      const serialNo = Util.GenerateRandomSerialno(6);
      const mfgDate = Util.getSystemDateTimeUTC();
      const expDate = Util.addYearsToDate(mfgDate, 10);

      const Cylinders = new Cylinder({
        ...reqBody,
        [TableFields.serialNo]: serialNo,
        [TableFields.mfgDate]: mfgDate,
        [TableFields.expDate]: expDate,
        [TableFields.department]: {
          [TableFields.ID]: department._id,
          [TableFields.name_]: department.name,
          [TableFields.email]: department.email,
        },
        [TableFields.createdBy]: {
          [TableFields.ID]: fillstation[TableFields.ID],
          [TableFields.name_]: fillstation[TableFields.name_],
          [TableFields.phoneNumber]: fillstation[TableFields.phoneNumber],
        },
      });
      cylinders.push(Cylinders);
    }
    try {
      // Insert all cylinders
      const insertedCylinders = await Cylinder.insertMany(cylinders);
      return insertedCylinders;
    } catch (error) {
      
      throw error;
    }
});
  };


}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.name_] = 1;
      projection[TableFields.ID] = 1;
      projection[TableFields.email] = 1;
      return this;
    };
    this.withPassword = () => {
      projection[TableFields.password] = 1;
      return this;
    };
    this.withUserType = () => {
      projection[TableFields.userType] = 1;
      return this;
    };
    this.withEmail = () => {
      projection[TableFields.email] = 1;
      return this;
    };
    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };
    this.withApproved = () => {
      projection[TableFields.approved] = 1;
      return this;
    };
    this.withPasswordResetToken = () => {
      projection[TableFields.passwordResetToken] = 1;
      return this;
    };
    this.withDeleted = () => {
      projection[TableFields.isDeleted] = 1;
      projection[TableFields.deletedAt] = 1;
      return this;
    };
    

    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = AdminService;
