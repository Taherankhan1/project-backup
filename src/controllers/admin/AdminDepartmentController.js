const DepartmentService = require("../../db/services/DepartmentService");
const FireFighterService = require("../../db/services/FireFighterService");
const FillStationService = require("../../db/services/FillStationService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const Email = require("../../utils/email");
const {
  TableFields,
  GeneralMsgs,
  TableNames,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");


/*--------------------------
--------admin department-----
---------------------------*/

exports.addDepartmentUser = async (req) => {
  const password = Util.generateRandomPassword(9);
  console.log(password);
  await DepartmentService.insertDepartmentRecord(req.body, req, password);

  let email = req.body[TableFields.email];
  email = (email + "").trim().toLowerCase();
  let user = await DepartmentService.findByEmail(email)
    .withPassword()
    .withBasicInfo()
    .execute();

  Email.SendAccountRegistrationdEmail(user[TableFields.name_], email, password);
};

exports.getAllDepartments = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let departments = await DepartmentService.getAllDepartment(
    sortBy,
    limit,
    skip,
    req.Admin.id
  )
    .withBasicInfo()
    .execute();

  return departments ;
};

exports.getDepartmentById = async (req) => {
  let department = await DepartmentService.getDepartmentById(
    req.params[TableFields.id].trim(),
    req.Admin[TableFields.id]
  )
    .withBasicInfo()
    .withPhone()
    .withAddress()
    .execute();
  if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);
  return { department };
};

exports.updateDepartment = async (req) => {
  const department = await DepartmentService.getDepartmentById(
    req.params[TableFields.id],
    req.Admin[TableFields.id]
  ).execute();
  if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);

  const updatedDepartment = await DepartmentService.updateDepartment(
    department[TableFields.ID],
    req.body
  ).execute();

  FireFighterService.updateCreatedBy(updatedDepartment).execute();
  CylinderService.updateDepartment(updatedDepartment).execute();
  FillStationService.updateCreatedBy(updatedDepartment).execute();
};

exports.deleteDepartment = async  (req) => {
  const department = await DepartmentService.getDepartment(
    req.params[TableFields.id]
  )
    .WithCreatedBy()
    .execute();
  if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);

  let adminId = department.createdBy[TableFields.ID];
  if (adminId.toString() !== req.Admin.id.toString())
    throw new ValidationError(GeneralMsgs.unauthorized);

  await ServiceManager.cascadeDelete(
    TableNames.Department,
    department[TableFields.ID]
  );
};