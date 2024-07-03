const {
  TableFields,
  ValidationMsgs,
  UserTypes,
  TableNames
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Department = require("../models/department");

class DepartmentService {

  static getUserById = (userId) => {
    return new ProjectionBuilder(async function () {
      return await Department.findOne({ [TableFields.ID]: userId }, this);
    });
  };

  static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await Department.findOne({[TableFields.email]:email ,[TableFields.isDeleted]:0}, this);
    });
  };

  static existsWithEmail = async (email, exceptionId) => {
    return await Department.exists({
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
    let user = await DepartmentService.findByEmail(email)
      .withId()
      .withBasicInfo()
      .withPasswordResetToken()
      .execute();
    if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);

    let code;
    if (!user[TableFields.passwordResetToken]) {
      code = DepartmentService.generateOTPCode();
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
    let user = await DepartmentService.findByEmail(email)
      .withId()
      .withBasicInfo()
      .withPasswordResetToken()
      .execute();
    if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);

    if (!user.isValidPassword(newPassword))throw new ValidationError(ValidationMsgs.PasswordInvalid);

    if (user[TableFields.passwordResetToken] == code) {
      user[TableFields.password] = newPassword;
      user[TableFields.passwordResetToken] = "";
      user[TableFields.tokens] = [];

      return await user.save();
    } else throw new ValidationError(ValidationMsgs.InvalidPassResetCode);
  };

  static updatePassword = async (
    userObj,
    newPassword,
  ) => {
    userObj[TableFields.password] = newPassword; // It will be hashed by Schema methods (pre hook 'save')
    await userObj.save();
  };


  static insertDepartmentRecord = async (reqBody, req, password) => {
    let email = reqBody[TableFields.email];
    let name = reqBody[TableFields.name_];
    email = (email + "").trim().toLocaleLowerCase();

    if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);
    if (email == password)throw new ValidationError(ValidationMsgs.PasswordInvalid);

    const adminId = req.Admin.id;
    const adminName = req.Admin.name;
    const adminEmail = req.Admin.email;

    // if (await DepartmentService.existsWithEmail(email)) throw new ValidationError(ValidationMsgs.DuplicateEmail);

    const user = new Department({
      ...reqBody,
      [TableFields.approved]: true,
      [TableFields.userType]: UserTypes.Department,
      [TableFields.password]: password,
      [TableFields.createdBy]: {
        [TableFields.ID]: adminId,
        [TableFields.name_]: adminName,
        [TableFields.email]: adminEmail,
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

  static saveAuthToken = async (userId, token) => {
    await Department.updateOne(
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

  static saveCreatedBy = async (userId, id, name, email) => {
    await Department.updateOne(
      {
        [TableFields.ID]: userId,
      },
      {
        $push: {
          [TableFields.createdBy]: {
            $each: [
              {
                [TableFields.ID]: id,
                [TableFields.name_]: name,
                [TableFields.email]: email,
              },
            ],
          },
        },
      }
    );
  };

  static getUserByIdAndToken = (userId, token) => {
    return new ProjectionBuilder(async function () {
      return await Department.findOne(
        {
          [TableFields.ID]: userId,
          [TableFields.tokens + "." + TableFields.token]: token,
        },
        this
      );
    });
  };

  static getAllDepartment = (sortBy, limit, skip, adminId) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {

     let count =await Department.countDocuments({[TableFields.isDeleted]:0,[TableFields.createdBy +"."+ TableFields.ID]:adminId},this)   
     let departments = await Department.find({[TableFields.isDeleted]:0,[TableFields.createdBy +"."+ TableFields.ID]:adminId}, this)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);

        return{count , departments}
    });
  };

  static removeAuth = async (departmentId, authToken) => {
    await Department.updateOne(
      {
        [TableFields.ID]: departmentId,
      },
      {
        $pull: {
          [TableFields.tokens]: { [TableFields.token]: authToken },
        },
      }
    );
  };

  static getDepartmentById = (userId,adminId) => {
    return new ProjectionBuilder(async function () {
        try {
            return await Department.findOne(
              {
                [TableFields.ID]: userId,[TableFields.createdBy +"."+ TableFields.ID]:adminId,[TableFields.isDeleted]:0
              },
              this
            );
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidDepartmentId);
            } 
        }
    });
 };
 
 static getDepartmentByAdmin = (adminId) => {
    return new ProjectionBuilder(async function () {
        try {
            return await Department.findOne(
              {
               [TableFields.createdBy +"."+ TableFields.ID]:adminId
              },
              this
            );
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidDepartmentId);
            } 
        }
    });
 };

  static getDepartment = (userId) => {
    return new ProjectionBuilder(async function () {
        try {
            return await Department.findOne(
                {
                  [TableFields.ID]: userId
                },
                this
              );
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidDepartmentId);
            } 
        }
    });
  };

  static updateDepartment = (departmentid, reqBody) => {
    return new ProjectionBuilder(async function () {
    const { name, email, phoneNumber, address } = reqBody;
    try {
      const updatedDepartment = await Department.findByIdAndUpdate(
        departmentid,
        {
          $set: {
            [TableFields.name_]: name,
            [TableFields.email]: email,
            [TableFields.phoneNumber]: phoneNumber,
            [TableFields.address]: address,
          },
        },
        { new: true, runValidators: true } 
      );
      return updatedDepartment;
    } catch (error) {
        if (error.code == 11000) {
            //Mongoose duplicate email error
            throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
          }
         else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidDepartmentId);
            } 
      throw error;
    }
});
  };

  static deleteMyReferences = async (
    cascadeDeleteMethodReference,
    tableName,
    ...referenceId
  ) => {
    let records = undefined;
    switch (tableName) {
      case TableNames.Department:
        records = await Department.find(
          {
            [TableFields.ID]: { $in: referenceId },
          },
          { [TableFields.ID]: 1 }
        );
        break;
        case TableNames.Admin:
            records = await Department.find(
              {
                [TableFields.createdBy +"."+TableFields.ID]: referenceId ,
              },
              { [TableFields.ID]: 1 }
            );
            break;
    }

    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);
      if (tableName == TableNames.Admin) {
        await Department.deleteMany({ 
            [TableFields.ID]: { $in: deleteRecordIds } 
          });
      }
      if (tableName == TableNames.Department) {
      await Department.deleteMany({ 
        [TableFields.ID]: { $in: deleteRecordIds } 
      });
    }
      if (tableName != TableNames.Department) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Department,
          ...deleteRecordIds
        ); //So, let's remove references which points to this model
      }
    }
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
    this.withPhone = () => {
      projection[TableFields.phoneNumber] = 1;
      return this;
    };
    this.withAddress = () => {
      projection[TableFields.address] = 1;
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
    this.WithCreatedBy = () => {
      projection[TableFields.createdBy] = 1;
      return this;
    };
    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = DepartmentService;
