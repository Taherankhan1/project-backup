const {
  TableFields,
  ValidationMsgs,
  UserTypes,
  TableNames,
  GeneralMsgs
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const FillStation = require("../models/fillStation");

class FillStationService {

  static getFillStationById = (stationId) => {
    return new ProjectionBuilder(async function () {
        try {
            return await FillStation.findOne({ [TableFields.ID]: stationId ,[TableFields.isDeleted]:0}, this);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidStationId);
            } 
         }
    });
  };

  static updateFillStation = (firefighterId, reqBody) => {
    return new ProjectionBuilder(async function () {
    let { name, phoneNumber, address} = reqBody;
    try {
      const updateFillStation = await FillStation.findByIdAndUpdate(
        firefighterId,
        {
          $set: {
            [TableFields.name_]: name,
            [TableFields.phoneNumber]: phoneNumber,
            [TableFields.address]: address
          },
        },
        { new: true ,runValidators:true}
      );
      return updateFillStation;
    } catch (error) {
        if (error.code == 11000) {
            //Mongoose duplicate email error
            throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);
          }
      throw error;
    }
   });
  };

  static updateCreatedBy = (records) => {
    const { _id, name, email } = records;
    return new ProjectionBuilder(async function () {
      return await FillStation.updateMany(
            { [TableFields.createdBy + "." + TableFields.ID ]: _id },
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

  static findByPhoneNumber = (phoneNumber) => {
    return new ProjectionBuilder(async function () {
      return await FillStation.findOne(
        { [TableFields.phoneNumber]: phoneNumber },
        this
      );
    });
  };

  static existsWithPhoneNumber = async (phoneNumber, exceptionId) => {
    return await FillStation.exists({
      [TableFields.phoneNumber]: phoneNumber,
      ...(exceptionId
        ? {
            [TableFields.ID]: { $ne: exceptionId },
          }
        : {}),
    });
  };

  static insertFillStationRecord = async (reqBody, req) => {
    let name = reqBody[TableFields.name_];
    let phoneNumber = reqBody[TableFields.phoneNumber];

    if (!name) throw new ValidationError(ValidationMsgs.NameEmpty);
    if (!phoneNumber) throw new ValidationError(ValidationMsgs.PhoneNumberEmpty);

    if (await FillStationService.existsWithPhoneNumber(phoneNumber)) throw new ValidationError(ValidationMsgs.DuplicatePhoneNumber);

    const fillStation = new FillStation({
      ...reqBody,
      [TableFields.approved]: true,
      [TableFields.userType]: UserTypes.FillStation,
      [TableFields.createdBy]: {
        [TableFields.ID]: req.Department.id,
        [TableFields.name_]: req.Department.name,
        [TableFields.email]: req.Department.email,
      },
    });

    try {
      await fillStation.save();
    } catch (error) {
      throw error;
    }
  };

  static getAllFillStation = (sortBy, limit, skip) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        let count = await FillStation.countDocuments({[TableFields.isDeleted]:0}, this)
        let fillstations= await FillStation.find({[TableFields.isDeleted]:0}, this)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);
        return{ count, fillstations}
    });
  };

  static getAllFillStationsByDepartment = (sortBy, limit, skip,departmentId) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        try {
            let count =await FillStation.countDocuments({[TableFields.isDeleted]:0,[TableFields.createdBy +"."+TableFields.ID]:departmentId}, this)
            let fillStations=await FillStation.find({[TableFields.isDeleted]:0,[TableFields.createdBy +"."+TableFields.ID]:departmentId}, this)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort(sortCriteria);
            return {count ,fillStations}
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidStationId);
            } 
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
      case TableNames.FillStation:
        records = await FillStation.find(
          {
            [TableFields.ID]: { $in: referenceId },
          },
          { [TableFields.ID]: 1 }
        );
        break;
        case TableNames.Department:
          records = await FillStation.find(
            {
              [TableFields.createdBy + "." + TableFields.ID ]: {$in:referenceId},
            },
            { [TableFields.ID]: 1 }
          );
          break;
    }
  
    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);

      if (tableName === TableNames.Department) {
        await FillStation.deleteMany({
          [TableFields.ID]: { $in: deleteRecordIds },
        });
      }

      await FillStation.deleteMany({ [TableFields.ID]: { $in: deleteRecordIds } },
      );

      if (tableName != TableNames.FillStation) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.FillStation,
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
    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };
    this.withApproved = () => {
      projection[TableFields.approved] = 1;
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

module.exports = FillStationService;
