const {
    TableFields,
    ValidationMsgs,
    UserTypes,
    TableNames,
    GeneralMsgs
  } = require("../../utils/constants");
  const Util = require("../../utils/util");
  const ValidationError = require("../../utils/ValidationError");
  const FireFighter = require("../models/fireFighter");

  class FireFighterService {

    static insertFireFighterRecord = async (reqBody, req,password) => {
        let email = reqBody[TableFields.email];
        let name = reqBody[TableFields.name_];
        email = (email + "").trim().toLocaleLowerCase();
        if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
        if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
        if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);
        if (email == password) throw new ValidationError(ValidationMsgs.PasswordInvalid);
    
        if (await FireFighterService.existsWithEmail(email)) throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
    
        const user = new FireFighter({
          ...reqBody,
          [TableFields.approved]: true,
          [TableFields.userType]: UserTypes.FireFighter,
          [TableFields.password]: password,
          [TableFields.createdBy]: {
            [TableFields.ID]: req.Department.id,
            [TableFields.name_]: req.Department.name,
            [TableFields.email]: req.Department.email,
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

    static updateCreatedBy = (records) => {
        const { _id, name, email } = records;
        return new ProjectionBuilder(async function () {
          return await FireFighter.updateMany(
                {  [TableFields.createdBy + "." + TableFields.ID ]: _id },
                {
                    $set: {
                      [TableFields.createdBy + "." + TableFields.ID ]: _id,
                      [TableFields.createdBy + "." + TableFields.name_ ]: name,
                      [TableFields.createdBy + "." + TableFields.email ]: email,
                    },
                },
              );
        });
    };

    static getAllFirefighter = (sortBy, limit, skip,departmentId) => {
        let sortCriteria = sortBy || '_id';
        return new ProjectionBuilder(async function () {
            try {
                let count = await FireFighter.countDocuments({[TableFields.isDeleted]:0,[TableFields.createdBy +"."+TableFields.ID]:departmentId}, this)
                let firefighters=await FireFighter.find({[TableFields.isDeleted]:0,[TableFields.createdBy +"."+TableFields.ID]:departmentId}, this)
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .sort(sortCriteria);
                return {count,firefighters}
            } catch (error) {
                if (error instanceof ValidationError) {
                    throw error;
                } else if (error.name === 'CastError') {
                    throw new ValidationError(ValidationMsgs.InvalidDepartmentId);
                } 
             }
         
        });
    };

    static getAllFirefighters = (sortBy, limit, skip) => {
        let sortCriteria = sortBy || '_id';
        return new ProjectionBuilder(async function () {
          let count = await FireFighter.countDocuments({[TableFields.isDeleted]:0},this)  
          let firefighters= await FireFighter.find({[TableFields.isDeleted]:0}, this)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort(sortCriteria);

            return{ count, firefighters }
        });
    };

    static getFireFighterById = (userId,departmentId) => {
        return new ProjectionBuilder(async function () {
            try {
                console.log("1");
                return await FireFighter.findOne(
                    {
                      [TableFields.ID]: userId,[TableFields.isDeleted]:0,[TableFields.createdBy +"."+TableFields.ID]:departmentId
                    },
                    this
                  );
            }catch (error) {
                if (error instanceof ValidationError) {
                    throw new ValidationError(GeneralMsgs.FFNotFound);
                } else if (error.name === 'CastError') {
                    throw new ValidationError(ValidationMsgs.InvalidFireFighterId);
                } 
            
             }
        });
    };

    static getFireFighter = (userId) => {
        return new ProjectionBuilder(async function () {
        try {
            return await FireFighter.findOne(
                {
                  [TableFields.ID]: userId,[TableFields.isDeleted]:0
                },
                this
              );
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidFireFighterId);
            } 
         }
        });
    };

    static updateFireFighter = async (firefighterId, reqBody) => {
        const { name, email, phoneNumber, address, age, gender} = reqBody;
        try {
          const updatedFireFighter = await FireFighter.findByIdAndUpdate(
            firefighterId,
            {
              $set: {
                [TableFields.name_]: name,
                [TableFields.email]: email,
                [TableFields.phoneNumber]: phoneNumber,
                [TableFields.address]: address,
                [TableFields.age]:age,
                [TableFields.gender]:gender
              },
            },
            { new: true , runValidators:true}
          );
      
          return updatedFireFighter;
        } catch (error) {
            if (error.code == 11000) {
                //Mongoose duplicate email error
                throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
              }
          throw error;
        }
    };

    static getUserById = (userId) => {
        return new ProjectionBuilder(async function () {
            return await FireFighter.findOne({[TableFields.ID]: userId}, this);
        });
    };

    static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await FireFighter.findOne({ email }, this);
    });
    };

    static existsWithEmail = async (email, exceptionId) => {
        return await FireFighter.exists({
          [TableFields.email]: email,
          ...(exceptionId
            ? {
                [TableFields.ID]: { $ne: exceptionId },
              }
            : {}),
        });
    };

    static getUserByIdAndToken = (userId, token) => {
        return new ProjectionBuilder(async function () {
          return await FireFighter.findOne(
            {
              [TableFields.ID]: userId,
              [TableFields.tokens + "." + TableFields.token]: token,
            },
            this
          );
        });
    };

    static saveAuthToken = async (userId, token) => {
        await FireFighter.updateOne(
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

    static removeAuth = async (firefighterId, authToken) => {
        await FireFighter.updateOne(
          {
            [TableFields.ID]: firefighterId,
          },
          {
            $pull: {
              [TableFields.tokens]: { [TableFields.token]: authToken },
            },
          }
        );
    };
  
    static generateOTPCode = () => {
        return Util.GenerateRandomSerialno(4);
    };
    
    static getResetPasswordToken = async (email) => {
    let user = await FireFighterService.findByEmail(email).withId().withBasicInfo().withPasswordResetToken().execute();
    if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);

    let code;
    if (!user[TableFields.passwordResetToken]) {
        code = FireFighterService.generateOTPCode();
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
    let user = await FireFighterService.findByEmail(email).withId().withBasicInfo().withPasswordResetToken().execute();
    if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);

    if (!user.isValidPassword(newPassword)) throw new ValidationError(ValidationMsgs.PasswordInvalid);

    if (user[TableFields.passwordResetToken] == code) {
        user[TableFields.password] = newPassword;
        user[TableFields.passwordResetToken] = "";
        user[TableFields.tokens] = [];
        return await user.save();

    } else throw new ValidationError(ValidationMsgs.InvalidPassResetCode);
    };

    static updatePassword = async (userObj, newPassword) => {
    userObj[TableFields.password] = newPassword; // It will be hashed by Schema methods (pre hook 'save')
    
    await userObj.save();
    };

    static deleteMyReferences = async (
    cascadeDeleteMethodReference,
    tableName,
    ...referenceId
  ) => {
    let records = undefined;
    switch (tableName) {
      case TableNames.FireFighter:
        records = await FireFighter.find(
          {
            [TableFields.ID]: { $in: referenceId },
          },
          { [TableFields.ID]: 1 }
        );
        break;
        case TableNames.Department:
          records = await FireFighter.find(
            {
              [TableFields.createdBy + "." + TableFields.ID ]: referenceId,
            },
            { [TableFields.ID]: 1, }
          );
          break;
 }
    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);

      if (tableName === TableNames.Department) {
        await FireFighter.deleteMany({
          [TableFields.ID]: { $in: deleteRecordIds },
        });
    }
      await FireFighter.deleteMany({
        [TableFields.ID]: { $in: deleteRecordIds } 
    });

      if (tableName != TableNames.FireFighter) {
     
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.FireFighter,
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
      this.withPasswordResetToken = () =>{
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
  
  module.exports = FireFighterService;
  