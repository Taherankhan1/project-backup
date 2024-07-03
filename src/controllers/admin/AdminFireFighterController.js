const AdminService = require("../../db/services/AdminService");
const DepartmentService = require("../../db/services/DepartmentService");
const FireFighterService = require("../../db/services/FireFighterService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const CylinderHistoryService = require("../../db/services/CylinderHistoryService");
const Email = require("../../utils/email");
const {
  TableFields,
  ValidationMsgs,
  GeneralMsgs,
  TableNames,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");

/*----------------------------
--------admin fireFighter-----
----------------------------*/

exports.getAllFireFighters = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let firefighters = await FireFighterService.getAllFirefighters(
    sortBy,
    limit,
    skip
  )
    .withBasicInfo()
    .execute();
  console.log(firefighters);
  return firefighters;
};

exports.addFireFighterUser = async (req) => {
  let departmentId = req.body[TableFields.departmentId];
  if (!departmentId)
    throw new ValidationError(ValidationMsgs.DepartmentIdEmpty);
  let department = await DepartmentService.getDepartment(
    departmentId
  ).execute();
  if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);

  const password = Util.generateRandomPassword(9);
  console.log(password);
  await AdminService.insertFireFighterRecord(
    req.body,
    req,
    password,
    department
  );

  let email = req.body[TableFields.email];
  email = (email + "").trim().toLowerCase();
  let user = await FireFighterService.findByEmail(email)
    .withPassword()
    .withBasicInfo()
    .execute();

  Email.SendAccountRegistrationdEmail(user[TableFields.name_], email, password);
};

exports.getFireFighterById = async (req) => {
  let firefighter = await FireFighterService.getFireFighter(
    req.params[TableFields.id].trim()
  )
    .withBasicInfo()
    .withPhone()
    .execute();
  if (!firefighter) throw new ValidationError(GeneralMsgs.FFNotFound);
  return { firefighter };
};

exports.getAssignedCylinders = async (req) => {
  let { sortBy, limit, skip } = req.query;

  let cylinders = await CylinderService.getAssignedCylinders(
    sortBy,
    limit,
    skip,
    req.params[TableFields.id].trim()
  )
    .withBasicInfo()
    .WithFireFighter()
    .withRemainingCapacity()
    .withInUse()
    .execute();

  return cylinders;
};

exports.assignCylinder = async (req) => {
  let cylinderId = req.body[TableFields.cylinderId];
  if (!cylinderId) throw new ValidationError(ValidationMsgs.CylinderIdEmpty);

  let firefighter = await FireFighterService.getFireFighter(
    req.params[TableFields.id]
  )
    .withBasicInfo()
    .execute();
  if (!firefighter) throw new ValidationError(GeneralMsgs.FFNotFound);

  const cylinder = await CylinderService.assignCylinder(firefighter, req.body)
    .withBasicInfo()
    .WithFireFighter()
    .withInUse()
    .execute();
  CylinderHistoryService.assign(cylinder).execute();
};

exports.unassignCylinder = async (req) => {
  let firefighter = await FireFighterService.getFireFighter(
    req.params[TableFields.id]
  ).execute();
  if (!firefighter) throw new ValidationError(GeneralMsgs.FFNotFound);
  const cylinder = await CylinderService.unassignCylinder(req.body)
    .WithFireFighter()
    .withBasicInfo()
    .withInUse()
    .execute();
  CylinderHistoryService.unassign(
    cylinder,
    firefighter[TableFields.ID]
  ).execute();
};

exports.updateFireFighter = async (req) => {
  let firefighter = await FireFighterService.getFireFighter(
    req.params[TableFields.id]
  ).execute();
  if (!firefighter) throw new ValidationError(GeneralMsgs.FFNotFound);

  let updatedFireFighter = await FireFighterService.updateFireFighter(
    firefighter[TableFields.ID],
    req.body
  );
  CylinderService.updateFireFighter(updatedFireFighter).execute();
};

exports.getAllFireFightersByDepartment = async (req) => {
  let { sortBy, limit, skip } = req.query;

  let departmentId = req.body[TableFields.departmentId].trim();
  if (!departmentId)
    throw new ValidationError(ValidationMsgs.DepartmentIdEmpty);
  let fireFighters = await FireFighterService.getAllFirefighter(
    sortBy,
    limit,
    skip,
    departmentId
  )
    .withBasicInfo()
    .execute();

  return fireFighters;
};

exports.deleteFireFighter = async function (req) {
  let fireFighter = await FireFighterService.getFireFighter(
    req.params[TableFields.id]
  )
    .WithCreatedBy()
    .execute();
  if (!fireFighter) throw new ValidationError(GeneralMsgs.FFNotFound);
  try {
    await ServiceManager.cascadeDelete(
      TableNames.FireFighter,
      fireFighter[TableFields.ID]
    );
  } catch (error) {
    throw error;
  }
};