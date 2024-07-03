const {
  TableFields,
  ValidationMsgs,
  TableNames,
} = require("../../utils/constants");   
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Cylinder = require("../models/cylinder");
const CylinderHistory =require("../models/cylinderHistory")
const FillStationService = require("./FillStationService");

class CylinderService {

  static updateDepartment = (records) => {
    const { _id, name, email } = records;
    return new ProjectionBuilder(async function () {
      return await Cylinder.updateMany(
            {  [TableFields.department + "." + TableFields.ID ]: _id },
            {
                $set: {
                  [TableFields.department + "." + TableFields.ID ]: _id,
                  [TableFields.department + "." + TableFields.name_ ]: name,
                  [TableFields.department + "." + TableFields.email ]: email,
                },
            },
          );
    });
  };

  static updateFireFighter = (records) => {
    const { _id, name, email } = records;
    return new ProjectionBuilder(async function () {
      return await Cylinder.updateMany(
            {  [TableFields.fireFighter + "." + TableFields.ID ]: _id },
            {
                $set: {
                  [TableFields.fireFighter + "." + TableFields.ID ]: _id,
                  [TableFields.fireFighter + "." + TableFields.name_ ]: name,
                  [TableFields.fireFighter + "." + TableFields.email ]: email,
                },
            },
          );
    });
  };

  static updateCreatedBy = (records) => {
    const { _id, name, phoneNumber } = records;
    return new ProjectionBuilder(async function () {
      return await Cylinder.updateMany(
            {  [TableFields.createdBy + "." + TableFields.ID ]: _id },
            {
                $set: {
                  [TableFields.createdBy + "." + TableFields.ID ]: _id,
                  [TableFields.createdBy + "." + TableFields.name_ ]: name,
                  [TableFields.createdBy + "." + TableFields.phoneNumber ]: phoneNumber,
                },
            },
          );
    });
  };

  static insertCylinderRecord = (reqBody, req) => {
    return new ProjectionBuilder(async function () {
        let quantity = parseInt(reqBody[TableFields.quantity]); 
        if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
          throw new ValidationError(ValidationMsgs.InvalidQuantity);
        }  
        console.log("quantity"+quantity);

    const fillStationId = reqBody[TableFields.stationId];
    if (!fillStationId)throw new ValidationError(ValidationMsgs.StationIdEmpty);

    const fillstation = await FillStationService.getFillStationById(fillStationId)
      .withBasicInfo()
      .withPhone()
      .execute();

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
          [TableFields.ID]: req.Department[TableFields.id],
          [TableFields.name_]: req.Department.name,
          [TableFields.email]: req.Department[TableFields.email],
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

  static getAllCylindersFromStation = (sortBy, limit, skip, fillStationId) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        try {
            let count =await Cylinder.countDocuments(
                {
                  [TableFields.createdBy + "." + TableFields.ID]: fillStationId,[TableFields.isDeleted]:0
                },
                this
              )
            let cylinders = await Cylinder.find(
              {
                [TableFields.createdBy + "." + TableFields.ID]: fillStationId,[TableFields.isDeleted]:0
              },
              this
            )
              .limit(parseInt(limit))
              .skip(parseInt(skip))
              .sort(sortCriteria);
            return {count,cylinders}
        }  catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            } else if (error.name === 'CastError') {
                throw new ValidationError(ValidationMsgs.InvalidStationId);
            } 
        }
    });
  };

  static getAllCylinders = (sortBy, limit, skip) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        let count = await Cylinder.countDocuments(
            {
              [TableFields.isDeleted]:0
            },
            this
          )
      let cylinders = await Cylinder.find(
        {
          [TableFields.isDeleted]:0
        },
        this
      )
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);

        return{count,cylinders}
    });
  };

  static getCylinderById = (id) => {
      return new ProjectionBuilder(async function () {
    try {
        return await Cylinder.findById(id, this);
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        } else if (error.name === 'CastError') {
            throw new ValidationError(ValidationMsgs.InvalidCylinderId);
        } 
    }
    });
  };

  static getUnUsedCylinders = (sortBy, limit, skip) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        let count =await Cylinder.countDocuments(
            {
              [TableFields.inUse]: false
            },
            this
          )
      let cylinders =await Cylinder.find(
        {
          [TableFields.inUse]: false
        },
        this
      )
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);

        return {count,cylinders}
    });
  };

  static getInUsedCylinders = (sortBy, limit, skip) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        let count= await Cylinder.countDocuments(
            {
              [TableFields.inUse]: true,[TableFields.isDeleted]:0
            },
            this
          )
      let cylinders = await Cylinder.find(
        {
          [TableFields.inUse]: true,[TableFields.isDeleted]:0
        },
        this
      )
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);
    return {count,cylinders}
    });
  };

  static getAssignedCylinders = (sortBy, limit, skip, firefighterId) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        let count = await Cylinder.countDocuments(
            {
              [TableFields.inUse]: true,
              [TableFields.fireFighter + "." + TableFields.ID]: firefighterId,
            },
            this
          )
      let cylinders= await Cylinder.find(
        {
          [TableFields.inUse]: true,
          [TableFields.fireFighter + "." + TableFields.ID]: firefighterId,
        },
        this
      )
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);
        return {count ,cylinders }
    });
  };
  
  static assignCylinder =(firefighter, reqBody) => {
    return new ProjectionBuilder(async function () {
    
    try {
        const cylinderId = reqBody[TableFields.cylinderId]
    if (!cylinderId) throw new ValidationError(ValidationMsgs.CylinderIdEmpty);
    const cylinder = await CylinderService.getCylinderById(cylinderId.trim()).execute();
        if (!cylinder) throw new ValidationError(ValidationMsgs.CylinderNOTfound);
        if (cylinder[TableFields.inUse] == true)throw new ValidationError(ValidationMsgs.CylinderInUse);

        cylinder[TableFields.fireFighter] = {
          [TableFields.ID]: firefighter[TableFields.ID],
          [TableFields.name_]: firefighter[TableFields.name_],
          [TableFields.email]: firefighter[TableFields.email],
        };
        cylinder[TableFields.inUse] = true;
        await cylinder.save();
        return cylinder;
    }  catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            throw new ValidationError(ValidationMsgs.InvalidCylinderId);
        } else {
            throw error;
        }
    }
});
  };

  static unassignCylinder = (reqBody) => {
    return new ProjectionBuilder(async function () {
        try {
            const cylinderId = reqBody[TableFields.cylinderId];
    if (!cylinderId) throw new ValidationError(ValidationMsgs.CylinderIdEmpty);

    const cylinder = await CylinderService.getCylinderById(cylinderId).execute();
    if (!cylinder) throw new ValidationError(ValidationMsgs.CylinderNOTfound);

    if (cylinder[TableFields.inUse] == false)throw new ValidationError(ValidationMsgs.CylinderUnUsed);

    cylinder[TableFields.fireFighter] = {
      [TableFields.ID]: null,
      [TableFields.name_]: null,
      [TableFields.email]: null,
    };
    cylinder[TableFields.inUse] = false;
    await cylinder.save();
    return cylinder;
}  catch (error) {
    if (error instanceof ValidationError) {
        throw error;
    } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new ValidationError(ValidationMsgs.InvalidCylinderId);
    } else {
        throw error;
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
      case TableNames.Cylinder:
        records = await Cylinder.find(
          {
            [TableFields.ID]: { $in: referenceId },
          },
          { [TableFields.ID]: 1 }
        );
        break;

      case TableNames.Department:
        records = await Cylinder.find(
          {
            [TableFields.department + "." +TableFields.ID]: referenceId ,
          },
          { [TableFields.ID]: 1,}
        );
        break;

      case TableNames.FireFighter:
        records = await Cylinder.find(
          {
            [TableFields.fireFighter + "." +TableFields.ID]: referenceId,
          },
          {  [TableFields.ID]: 1,}
        );
        break;

      case TableNames.FillStation:
        records = await Cylinder.find(
          {
            [TableFields.createdBy + "." +TableFields.ID]: referenceId,
          },
          {  [TableFields.ID]: 1,}
        );
        break;
    }

    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);
      
      if (tableName == TableNames.Cylinder) {
        await Cylinder.deleteMany({
            [TableFields.ID]: { $in: deleteRecordIds },
       });
    }
      if (tableName == TableNames.Department) {
        // Now, delete  records
        await Cylinder.deleteMany({
            [TableFields.ID]: { $in: deleteRecordIds },
       });
      }

      if (tableName == TableNames.FireFighter) {
        // Now, delete these records
        await Cylinder.updateMany(
          {
            [TableFields.ID]: {
                $in: deleteRecordIds,
              },
          },
          {
              [TableFields.inUse]: false,
              $unset:{[TableFields.fireFighter]:"" }
          }
        );
      } 
      if (tableName == TableNames.FillStation) {
        // Now, delete these records
        await Cylinder.deleteMany({
            [TableFields.ID]:{ $in: deleteRecordIds, },
          });
      } 
      if (tableName != TableNames.Cylinder) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Cylinder,
          ...deleteRecordIds
        ); //So, let's remove references which points to this model
      }
    }
  };

  static getAllCylinderHistory = (sortBy, limit, skip) => {
    let sortCriteria = sortBy || '_id';
    return new ProjectionBuilder(async function () {
        let count = await CylinderHistory.countDocuments(
            {},
            this
          )
      let cylinders = await CylinderHistory.find(
        {},
        this
      )
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sortCriteria);

        return{count,cylinders}
    });
  };

//   static decrease = (reqBody, req) => {
//     return new ProjectionBuilder(async function () {
//     let quantity = reqBody[TableFields.quantity];
//     if (!quantity) throw new ValidationError(ValidationMsgs.QuantityEmpty);

//     let id = req.FireFighter.id;
//     let name = req.FireFighter.name;
//     let email = req.FireFighter.email;

//     let unusedCylinders = await Cylinder.find({ inUse: false });
//     console.log(unusedCylinders.length);
//     if (quantity > unusedCylinders.length) {
//       throw new ValidationError(ValidationMsgs.QuantityNotAvail);
//     }

//     const updatedCylinders = [];
//     for (let i = 0; i < quantity; i++) {
//       let cylinder = unusedCylinders[i];
//       if (!cylinder) {
//         throw new ValidationError(ValidationMsgs.QuantityNotAvail);
//       }
//       cylinder[TableFields.fireFighter] = {
//         [TableFields.ID]: id,
//         [TableFields.name_]: name,
//         [TableFields.email]: email,
//       };
//       cylinder.inUse = true;
//       await cylinder.save();
//       updatedCylinders.push(cylinder);
//     }

//     return updatedCylinders;
// });
//   };
  
}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.serialNo] = 1;
      projection[TableFields.mfgDate] = 1;
      projection[TableFields.expDate] = 1;
      projection[TableFields.inUse] = 1;
      return this;
    };
    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };
    this.withInUse = () => {
      projection[TableFields.inUse] = 1;
      return this;
    };
    this.withCapacity = () => {
        projection[TableFields.maxCapacity] = 1;
        return this;
      };
      this.withRemainingCapacity = () => {
        projection[TableFields.remainingCapacity] = 1;
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
    this.WithFireFighter = () => {
      projection[TableFields.fireFighter] = 1;
      return this;
    };
    this.WithDepartment = () => {
      projection[TableFields.department] = 1;
      return this;
    };
    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = CylinderService;
