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
const AdminService = require("../db/services/AdminService");

const auth = async (req, res, next) => {
  try {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(headerToken, process.env.JWT_ADMIN_PK);
    const admin = await AdminService.getUserByIdAndToken(
      decoded[TableFields.ID],
      headerToken
    )
      .withDeleted()
      .withBasicInfo()
      .withApproved()
      .execute();
    if (!admin) {
      throw new ValidationError();
    }

    if (
      admin[TableFields.approved] == true &&
      admin[TableFields.isDeleted] == 0
    ) {
      req.Admin = req.Admin || {}; // Initialize req.Admin if it's undefined
      req.Admin.id = admin._id;
      req.Admin.name = admin.name;
      req.Admin.email = admin.email;

      req[TableFields.interface] =
        decoded[TableFields.interface] || InterfaceTypes.Admin.AdminWeb;
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
