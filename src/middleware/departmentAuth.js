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
const DepartmentService = require("../db/services/DepartmentService");

const auth = async (req, res, next) => {
  try {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(headerToken, process.env.JWT_DEPT_PK);
    const department = await DepartmentService.getUserByIdAndToken(
      decoded[TableFields.ID],
      headerToken
    ) .withDeleted()
      .withBasicInfo()
      .withApproved()
      .execute();

    if (!department) {
      throw new ValidationError();
    }

    if (department[TableFields.approved] == true && department[TableFields.isDeleted] == 0) {
      req.Department = req.Department || {}; 
      req.Department.id = department._id;
      req.Department.name = department.name;
      req.Department.email = department.email;
      
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
