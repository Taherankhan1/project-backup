const AdminService = require("../../db/services/AdminService");
const DepartmentService = require("../../db/services/DepartmentService");
const FillStationService = require("../../db/services/FillStationService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const {
  TableFields,
  ValidationMsgs,
  GeneralMsgs,
  TableNames,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");


/*----------------------------
--------admin fillStation-----
----------------------------*/

exports.getAllFillStations = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let fillStations = await FillStationService.getAllFillStation(
    sortBy,
    limit,
    skip
  )
    .withBasicInfo()
    .withPhone()
    .withAddress()
    .execute();

  return  fillStations ;
};

exports.addFillStation = async (req) => {
  let departmentId = req.body[TableFields.departmentId];
  if (!departmentId)
    throw new ValidationError(ValidationMsgs.DepartmentIdEmpty);
  let department = await DepartmentService.getDepartment(
    departmentId
  ).execute();
  console.log(department);
  if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);

  await AdminService.insertFillStationRecord(req.body, department);
};

exports.getAllFillStationsByDepartment = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let departmentId = req.body[TableFields.departmentId];
  if (!departmentId)
    throw new ValidationError(ValidationMsgs.DepartmentIdEmpty);
  let fillStations = await FillStationService.getAllFillStationsByDepartment(
    sortBy,
    limit,
    skip,
    departmentId
  )
    .withBasicInfo()
    .withPhone()
    .execute();
 

  return fillStations
};

exports.updateFillStation = async (req) => {
  let fillStation = await FillStationService.getFillStationById(
    req.params[TableFields.id]
  ).execute();
  if (!fillStation) throw new ValidationError(GeneralMsgs.StatioNotFound);

  const updateFillStation = await FillStationService.updateFillStation(
    fillStation[TableFields.ID],
    req.body
  ).execute();
  CylinderService.updateCreatedBy(updateFillStation).execute();
};

exports.deleteFillStation = async function (req, res) {
  const station = await FillStationService.getFillStationById(
    req.params[TableFields.id]
  )
    .WithCreatedBy()
    .execute();
  if (!station) throw new ValidationError(GeneralMsgs.StatioNotFound);

  await ServiceManager.cascadeDelete(
    TableNames.FillStation,
    station[TableFields.ID]
  );
};

exports.getFillStationById = async (req) => {
  let FillStation = await FillStationService.getFillStationById(
    req.params[TableFields.id].trim()
  ).execute();
  if (!FillStation) throw new ValidationError(GeneralMsgs.StatioNotFound);

  return FillStation;
};
