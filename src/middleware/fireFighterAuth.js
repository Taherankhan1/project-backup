const jwt = require("jsonwebtoken");
const {
  ValidationMsgs,
  TableFields,
  UserTypes,
  InterfaceTypes,
  ResponseStatus,
} = require("../utils/constants");
const Util = require("../utils/util");
const ValidationError = require("../utils/ValidationError");
const FireFighterService = require("../db/services/FireFighterService");

const auth = async (req, res, next) => {
  try {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(headerToken, process.env.JWT_FIGHTER_PK);
    const fireFighter = await FireFighterService.getUserByIdAndToken(
      decoded[TableFields.ID],
      headerToken
    )
      .withDeleted()
      .withBasicInfo()
      .withApproved()
      .execute();

    if (!fireFighter) {
      throw new ValidationError();
    }

    if (fireFighter[TableFields.approved] == true && fireFighter[TableFields.isDeleted] == 0) {
      req.FireFighter = req.FireFighter || {}; 
      req.FireFighter.id = fireFighter._id;
      req.FireFighter.name = fireFighter.name;
      req.FireFighter.email = fireFighter.email;
    
      next();
    } else {
      res
        .status(ResponseStatus.Unauthorized)
        .send(Util.getErrorMessageFromString(ValidationMsgs.AuthFail));
    }
  } catch (e) {
    if (!(e instanceof ValidationError)) {
      console.log(e);
    }
    //Error due to:
    // - No token in header  OR
    // - Token not exists in the database
    res
      .status(ResponseStatus.Unauthorized)
      .send(Util.getErrorMessageFromString(ValidationMsgs.AuthFail));
  }
};
module.exports = auth;
