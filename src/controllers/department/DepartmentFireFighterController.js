const FireFighterService = require("../../db/services/FireFighterService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const CylinderHistoryService = require("../../db/services/CylinderHistoryService");
const Email = require("../../utils/email");
const {
  TableFields,
  TableNames,
  GeneralMsgs,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");

/***-----------------------------------
--------Department firefighter-------
------------------------------------***/

exports.addFireFighterUser = async (req) => {
  const password = Util.generateRandomPassword(9);
  console.log(password);
  await FireFighterService.insertFireFighterRecord(req.body, req, password);

  let email = req.body[TableFields.email];
  email = (email + "").trim().toLowerCase();
  let user = await FireFighterService.findByEmail(email)
    .withPassword()
    .withBasicInfo()
    .execute();

  Email.SendAccountRegistrationdEmail(user[TableFields.name_], email, password);
};

exports.getAllFireFighter = async (req) => {
  let { sortBy, limit, skip } = req.query;
  let firefighters = await FireFighterService.getAllFirefighter(
    sortBy,
    limit,
    skip,
    req.Department[TableFields.id]
  )
    .withBasicInfo()
    .withPhone()
    .execute();

  return firefighters;
};

exports.getFireFighterById = async (req) => {
  let firefighter = await FireFighterService.getFireFighterById(
    req.params[TableFields.id].trim(),
    req.Department[TableFields.id]
  )
    .withBasicInfo()
    .withPhone()
    .execute();
  if (!firefighter) throw new ValidationError(GeneralMsgs.FFNotFound);

  return { firefighter };
};

exports.assignCylinder = async (req) => {
  let firefighter = await FireFighterService.getFireFighterById(
    req.params[TableFields.id],
    req.Department[TableFields.id]
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
  let firefighter = await FireFighterService.getFireFighterById(
    req.params[TableFields.id],
    req.Department[TableFields.id]
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
  let firefighter = await FireFighterService.getFireFighterById(
    req.params[TableFields.id],
    req.Department[TableFields.id]
  ).execute();
  if (!firefighter) throw new ValidationError(GeneralMsgs.FFNotFound);

  let departmentId = firefighter.createdBy[TableFields.ID];
  if (!departmentId) {
    throw new ValidationError(GeneralMsgs.DeptNotFound);
  }
  if (departmentId.toString() !== req.Department.id.toString())
    throw new ValidationError(GeneralMsgs.unauthorizedToEdit);

  let updatedFireFighter = await FireFighterService.updateFireFighter(
    firefighter[TableFields.ID],
    req.body
  );
  CylinderService.updateFireFighter(updatedFireFighter).execute();
};

exports.deleteFireFighter = async function (req) {
  let fireFighter = await FireFighterService.getFireFighterById(
    req.params[TableFields.id],
    req.Department[TableFields.id]
  )
    .WithCreatedBy()
    .execute();
  if (!fireFighter) throw new ValidationError(GeneralMsgs.FFNotFound);

  let departmentId = fireFighter.createdBy[TableFields.ID];
  if (!departmentId) {
    throw new ValidationError(GeneralMsgs.DeptNotFound);
  }
  if (departmentId.toString() !== req.Department.id.toString())
    throw new ValidationError(GeneralMsgs.unauthorized);
  try {
    await ServiceManager.cascadeDelete(
      TableNames.FireFighter,
      fireFighter[TableFields.ID]
    );
  } catch (error) {
    throw error;
  }
};
