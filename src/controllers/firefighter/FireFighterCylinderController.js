const CylinderService = require("../../db/services/CylinderService");
const CylinderHisoryService = require("../../db/services/CylinderHistoryService");
const {
  TableFields,
  ValidationMsgs,
  GeneralMsgs,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

/***-----------------------------------
-----------firefighter Cylinder--------
------------------------------------***/

exports.assigned = async (req) => {
  const { sortBy, limit, skip } = req.query;

  let cylinders = await CylinderService.getAssignedCylinders(
    sortBy,
    limit,
    skip,
    req.FireFighter[TableFields.id]
  )
    .withBasicInfo()
    .withRemainingCapacity()
    .withInUse()
    .execute();

  return cylinders;
};

exports.decrease = async (req) => {
  const cylinder = await CylinderService.getCylinderById(
    req.params[TableFields.id]
  )
    .WithFireFighter()
    .withRemainingCapacity()
    .execute();
  console.log("cylinder" + cylinder);
  if (!cylinder) throw new ValidationError(GeneralMsgs.CylinderNotFound);

  let firefighterid = cylinder.fireFighter._id;
  if (!firefighterid) {
    throw new ValidationError(GeneralMsgs.CylinderNotAssigned);
  }
  if (firefighterid.toString() !== req.FireFighter.id.toString())
    throw new ValidationError(GeneralMsgs.CylinderNotAssigned);

  const decreaseAmount = parseFloat(req.body[TableFields.quantity]);
  if (isNaN(decreaseAmount) || decreaseAmount <= 0)
    throw new ValidationError(ValidationMsgs.QuantityInvalid);

  if (cylinder[TableFields.remainingCapacity] < decreaseAmount)
    throw new ValidationError(ValidationMsgs.NotEnoughRemainingCapacity);
  cylinder[TableFields.remainingCapacity] =
    cylinder[TableFields.remainingCapacity] - decreaseAmount;
  cylinder[TableFields.remainingCapacity] = +cylinder[
    TableFields.remainingCapacity
  ].toFixed(2);
  await cylinder.save();
};

exports.unassignCylinder = async (req) => {
  let cylinder = await CylinderService.getCylinderById(
    req.params[TableFields.id]
  )
    .WithFireFighter()
    .execute();
  if (!cylinder) throw new ValidationError(GeneralMsgs.CylinderNotFound);

  let firefighterid = cylinder.fireFighter[TableFields.ID];
  if (!firefighterid) {
    throw new ValidationError(GeneralMsgs.CylinderNotAssigned);
  }
  if (firefighterid.toString() !== req.FireFighter.id.toString())
    throw new ValidationError(GeneralMsgs.CylinderNotAssigned);
  req.body[TableFields.cylinderId] = cylinder[TableFields.ID];

  let updatedcylinder = await CylinderService.unassignCylinder(
    req.body
  ).execute();
  CylinderHisoryService.unassign(updatedcylinder, firefighterid).execute();
};