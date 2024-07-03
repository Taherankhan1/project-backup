const FireFighterService = require("../../db/services/FireFighterService");
const CylinderService = require("../../db/services/CylinderService");
const {
  InterfaceTypes,
  TableFields,
  ValidationMsgs,
  GeneralMsgs,
  TableNames,
} = require("../../utils/constants");
const Email=require("../../utils/email")
const ValidationError = require("../../utils/ValidationError");
const ServiceManager = require("../../db/serviceManager");

/*--------------------------------
--------Firefighter auth----------
---------------------------------*/

exports.login = async (req) => {
  let email = req.body[TableFields.email];
  if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
  email = (email + "").trim().toLowerCase();

  const password = req.body[TableFields.password];
  if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

  let user = await FireFighterService.findByEmail(email)
    .withPassword()
    .withDeleted()
    .withUserType()
    .withBasicInfo()
    .execute();
    if(user[TableFields.isDeleted] == 1){
        throw new ValidationError(ValidationMsgs.AccountIsDeleted);
    }
    if (user && (await user.isValidAuth(password))) {
    const token = user.createAuthToken(InterfaceTypes.FireFighter.FireFighterWeb);
    
    await FireFighterService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
  } 
  else throw new ValidationError(ValidationMsgs.UnableToLogin);
};

exports.logout = async (req) => {
  const headerToken = req.header("Authorization").replace("Bearer ", "");
  FireFighterService.removeAuth(req.FireFighter[TableFields.id], headerToken);
};

exports.index = async (req) => {
  let fireFighter = await FireFighterService.getFireFighter(req.FireFighter[TableFields.id]).withBasicInfo().withAddress().withPhone().execute();
  return fireFighter;
};

exports.forgotPassword = async (req) => {
  let providedEmail = req.body[TableFields.email];
  providedEmail = (providedEmail + "").trim().toLowerCase();

  if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);

  let { code, name } = await FireFighterService.getResetPasswordToken(providedEmail);

  Email.SendForgotPasswordEmail(name, providedEmail, code);
};

exports.resetPassword = async (req) => {
  let providedEmail = req.body[TableFields.email];
  providedEmail = (providedEmail + "").trim().toLowerCase();

  const { code, newPassword } = req.body;

  if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);
  if (!code) throw new ValidationError(ValidationMsgs.PassResetCodeEmpty);
  if (!newPassword) throw new ValidationError(ValidationMsgs.NewPasswordEmpty);

  await FireFighterService.resetPassword(providedEmail,code,newPassword);

};

exports.changePassword = async (req) => {
  let { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    throw new ValidationError(ValidationMsgs.ParametersError);

  let user = await FireFighterService.getUserById(req.FireFighter[TableFields.id])
    .withPassword()
    .withId()
    .execute();

  if (user && (await user.isValidAuth(oldPassword))) {
    if (!user.isValidPassword(newPassword))
     throw new ValidationError(ValidationMsgs.PasswordInvalid);

    await FireFighterService.updatePassword(user,newPassword);

} else throw new ValidationError(ValidationMsgs.OldPasswordIncorrect);
};

exports.updateOwnProfile = async (req) => {

    const updatedFireFighter = await FireFighterService.updateFireFighter(req.FireFighter[TableFields.id],req.body);
    CylinderService.updateFireFighter(updatedFireFighter).execute();

    // return updatedFireFighter;
};

exports.deleteAccount = async  (req) => {
  try {
    const fireFighter = await FireFighterService.getFireFighter(req.FireFighter[TableFields.id])
      .withBasicInfo()
      .execute();
    if (!fireFighter) throw new ValidationError(GeneralMsgs.FFNotFound);

    await ServiceManager.cascadeDelete(TableNames.FireFighter, req.FireFighter[TableFields.id]);

  } catch (error) {
    console.error("Error deleting fireFighter account:", error);
  }
};