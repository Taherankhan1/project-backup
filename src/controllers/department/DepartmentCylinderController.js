const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const {
    TableFields,
    TableNames,
    GeneralMsgs
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
  
/***-----------------------------------
---------Department cylinders----------
------------------------------------***/

exports.addCylinders = async (req) => {
    await CylinderService.insertCylinderRecord(req.body, req)
    .execute()
};

exports.getAllCylindersFromStation = async (req) => {
     
    let { sortBy, limit, skip } = req.query;
    let cylinders = await CylinderService.getAllCylindersFromStation(sortBy,limit,skip,req.params[TableFields.id])
        .withBasicInfo()
        .WithCreatedBy()
        .execute();
    return cylinders
};

exports.getAllCylinders = async (req) => {

    let { sortBy, limit, skip } = req.query;
    let cylinders = await CylinderService.getAllCylinders(sortBy,limit,skip)
        .withBasicInfo()
        .withCapacity()
        .withInUse()
        .withRemainingCapacity()
        .execute();
      

    return cylinders;
};

exports.getCylinderById = async (req) => {
    let cylinder = await CylinderService.getCylinderById(req.params[TableFields.id]).withBasicInfo().withInUse().execute();
    if (!cylinder) throw new ValidationError(GeneralMsgs.CylinderNotFound);
    return {cylinder};
};

exports.getUnUsedCylinders = async (req) => {
    const { sortBy, limit, skip } = req.query;
    let cylinders = await CylinderService.getUnUsedCylinders(sortBy, limit, skip)
        .withBasicInfo()
        .withInUse()
        .execute();
    return cylinders;
};

exports.getInUsedCylinders = async (req) => {
    const { sortBy, limit, skip } = req.query;
    let cylinders = await CylinderService.getInUsedCylinders(sortBy, limit, skip)
        .withBasicInfo()
        .withInUse()
        .execute();
     
    return cylinders
};

exports.deleteCylinder = async function (req, res) {
    try {
      let cylinder = await CylinderService.getCylinderById(req.params[TableFields.id])
      .WithCreatedBy()
      .execute();
      if (!cylinder) throw new ValidationError(GeneralMsgs.CylinderNotFound);
  
      await ServiceManager.cascadeDelete(TableNames.Cylinder, cylinder[TableFields.ID]);
    } catch (error) {
     throw error
    }
};