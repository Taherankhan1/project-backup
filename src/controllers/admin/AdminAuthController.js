const AdminService = require("../../db/services/AdminService");
const DepartmentService = require("../../db/services/DepartmentService");
const ServiceManager = require("../../db/serviceManager");
const Email = require("../../utils/email");
const {
  InterfaceTypes,
  TableFields,
  ValidationMsgs,
  GeneralMsgs,
  TableNames,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

/***---------------------------
---------admin auth-----------
----------------------------***/

exports.addAdminUser = async (req) => {
    console.log(req.body[TableFields.name_]);
  await AdminService.insertAdminRecord(req.body);

  let email = req.body[TableFields.email];
  email = (email + "").trim().toLowerCase();
  let user = await AdminService.findByEmail(email).withBasicInfo().execute();

  Email.SendAccountRegistrationdEmail(user[TableFields.name_], email);
};

exports.login = async (req) => {
  let email = req.body[TableFields.email];
  if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
  email = (email + "").trim().toLowerCase();

  let password = req.body[TableFields.password];
  password = (password + "").trim();
  if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

  let user = await AdminService.findByEmail(email)
    .withPassword()
    .withBasicInfo()
    .execute();

    if (user && (await user.isValidAuth(password))) {
    const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
    await AdminService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
  } else throw new ValidationError(ValidationMsgs.UnableToLogin);
};

exports.forgotPassword = async (req) => {
  let providedEmail = req.body[TableFields.email];
  providedEmail = (providedEmail + "").trim().toLowerCase();

  if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);

  let { code, name } = await AdminService.getResetPasswordToken(providedEmail);
  Email.SendForgotPasswordEmail(name, providedEmail, code);
};

exports.resetPassword = async (req) => {
  let providedEmail = req.body[TableFields.email];
  providedEmail = (providedEmail + "").trim().toLowerCase();

  const { code, newPassword } = req.body;

  if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);
  if (!code) throw new ValidationError(ValidationMsgs.PassResetCodeEmpty);
  if (!newPassword) throw new ValidationError(ValidationMsgs.NewPasswordEmpty);

  await AdminService.resetPassword(providedEmail, code, newPassword);
};

exports.changePassword = async (req) => {
  let { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    throw new ValidationError(ValidationMsgs.ParametersError);

  let user = await AdminService.getUserById(req.Admin[TableFields.id])
    .withPassword()
    .withId()
    .execute();
  if (user && (await user.isValidAuth(oldPassword))) {
    if (!user.isValidPassword(newPassword))
      throw new ValidationError(ValidationMsgs.PasswordInvalid);

    await AdminService.updatePassword(user, newPassword);
  } else throw new ValidationError(ValidationMsgs.OldPasswordIncorrect);
};

exports.logout = async (req) => {
  const headerToken = req.header("Authorization").replace("Bearer ", "");
  AdminService.removeAuth(req.Admin[TableFields.id], headerToken);
};  

exports.deleteAccount = async (req) => {
  try {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    const admin = await AdminService.getUserByToken(headerToken)
      .withBasicInfo()
      .execute();

    if (!admin) throw new ValidationError(GeneralMsgs.UserNotFound);
    department = await DepartmentService.getDepartmentByAdmin(
      admin[TableFields.ID]
    ).execute();
    console.log(department);
    if (department && department.length > 0) {
        await ServiceManager.cascadeDelete(
          TableNames.Department,
          department[TableFields.ID]
        );
      }
  
    await ServiceManager.cascadeDelete(TableNames.Admin, admin[TableFields.ID]);
  } catch (error) {
    throw error;
  }
};