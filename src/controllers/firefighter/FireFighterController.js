const FireFighterService = require("../../db/services/FireFighterService");
const CylinderService = require("../../db/services/CylinderService");
const {
  TableFields,
} = require("../../utils/constants");

/*--------------------------------
--------Firefighter Default-------
---------------------------------*/

exports.index = async (req) => {
  let fireFighter = await FireFighterService.getFireFighter(req.FireFighter[TableFields.id]).withBasicInfo().withAddress().withPhone().execute();
  return fireFighter;
};

exports.updateOwnProfile = async (req) => {

    const updatedFireFighter = await FireFighterService.updateFireFighter(req.FireFighter[TableFields.id],req.body);
    CylinderService.updateFireFighter(updatedFireFighter).execute();

    // return updatedFireFighter;
};