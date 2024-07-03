const AdminService = require("../../db/services/AdminService");
const DepartmentService = require("../../db/services/DepartmentService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const {
  TableFields,
  ValidationMsgs,
  GeneralMsgs,
  TableNames,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");


/**----------------------------
---------admin cylinders------
----------------------------**/

exports.getAllCylinders = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let cylinders = await CylinderService.getAllCylinders(sortBy, limit, skip)
    .withBasicInfo()
    .execute();
  

  return cylinders;
};

exports.addCylinders = async (req) => {
  let departmentId = req.body[TableFields.departmentId];
  if (!departmentId)
    throw new ValidationError(ValidationMsgs.DepartmentIdEmpty);
  let department = await DepartmentService.getDepartment(
    departmentId
  ).execute();
  if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);
  await AdminService.insertCylinderRecord(req.body, department).execute();
};

exports.getCylinderById = async (req) => {
  let cylinder = await CylinderService.getCylinderById(
    req.params[TableFields.id].trim()
  )
    .withBasicInfo()
    .withInUse()
    .withCapacity()
    .withRemainingCapacity()
    .execute();

  return { cylinder };
};

exports.getUnUsedCylinders = async (req) => {
  const { sortBy, limit, skip } = req.query;
  let cylinders = await CylinderService.getUnUsedCylinders(sortBy, limit, skip)
    .withBasicInfo()
    .withInUse()
    .execute();
  return cylinders
};

exports.getInUsedCylinders = async (req) => {
  const { sortBy, limit, skip } = req.query;
  let cylinders = await CylinderService.getInUsedCylinders(sortBy, limit, skip)
    .withBasicInfo()
    .WithFireFighter()
    .withInUse()
    .withCapacity()
    .withRemainingCapacity()
    .execute();
 
  return cylinders;
};

exports.getAllCylindersByFillStation = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let stationId = req.body[TableFields.stationId];
  if (!stationId) throw new ValidationError(ValidationMsgs.StationIdEmpty);
  let cylinders = await CylinderService.getAllCylindersFromStation(
    sortBy,
    limit,
    skip,
    stationId
  )
    .withBasicInfo()
    .execute();
 
  return cylinders
};

exports.decrease = async (req) => {
  const cylinder = await CylinderService.getCylinderById(
    req.params[TableFields.id].trim()
  )
    .WithFireFighter()
    .withRemainingCapacity()
    .execute();
  if (!cylinder) throw new ValidationError(GeneralMsgs.CylinderNotFound);

  const decreaseAmount = parseFloat(req.body[TableFields.quantity]);
  if (isNaN(decreaseAmount) || decreaseAmount <= 0)
    throw new ValidationError(ValidationMsgs.QuantityInvalid);

  if (cylinder[TableFields.remainingCapacity] < decreaseAmount)
    throw new ValidationError(ValidationMsgs.NotEnoughRemainingCapacity);
  cylinder[TableFields.remainingCapacity] = cylinder[TableFields.remainingCapacity] - decreaseAmount;
  cylinder[TableFields.remainingCapacity] = +cylinder[TableFields.remainingCapacity].toFixed(2);
  await cylinder.save();
};

exports.deleteCylinder = async (req) => {
  try {
    const cylinder = await CylinderService.getCylinderById(
      req.params[TableFields.id]
    ).execute();
    if (!cylinder) throw new ValidationError(GeneralMsgs.CylinderNotFound);

    await ServiceManager.cascadeDelete(
      TableNames.Cylinder,
      cylinder[TableFields.ID]
    );
  } catch (error) {
    throw error;
  }
};

exports.cylinderHistory =async(req) => {
    let { sortBy, limit, skip } = req.query;

    let cylinders = await CylinderService.getAllCylinderHistory(
        sortBy,
        limit,
        skip,
      )
        .execute();
     
      return cylinders
};