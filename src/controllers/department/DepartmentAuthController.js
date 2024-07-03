const FireFighterService = require("../../db/services/FireFighterService");
const FillStationService = require("../../db/services/FillStationService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const Email = require("../../utils/email");
const DepartmentService = require("../../db/services/DepartmentService");
const {
    InterfaceTypes,
    TableFields,
    ValidationMsgs,
    TableNames,
    GeneralMsgs
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

/*-------------------------------
--------Department auth----------
---------------------------------*/

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    email = (email + "").trim().toLowerCase();

    const password = req.body[TableFields.password];
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    let user = await DepartmentService.findByEmail(email)
        .withPassword()
        .withBasicInfo()
        .execute();
      
    if (user && (await user.isValidAuth(password))) {
        const token = user.createAuthToken(InterfaceTypes.Department.DepartmentWeb);
        await DepartmentService.saveAuthToken(user[TableFields.ID], token);

        return { user, token };
    } else throw new ValidationError(ValidationMsgs.UnableToLogin);
};

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    DepartmentService.removeAuth(req.Department[TableFields.id], headerToken);
};

exports.index = async (req) => {
    let department = await DepartmentService.getDepartment(req.Department[TableFields.id]).withBasicInfo().withAddress().execute();

    return {department};
};

exports.updateOwnProfile = async (req) => {

    let department = await DepartmentService.getDepartment(req.Department[TableFields.id]).execute();
    if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);

    let updatedDepartment = await DepartmentService.updateDepartment(req.Department[TableFields.id],req.body).withBasicInfo().withDeleted().execute()

    FireFighterService.updateCreatedBy(updatedDepartment).execute();
    CylinderService.updateDepartment(updatedDepartment).execute();
    FillStationService.updateCreatedBy(updatedDepartment).execute();

};

exports.forgotPassword = async (req) => {
    let providedEmail = req.body[TableFields.email];
    providedEmail = (providedEmail + "").trim().toLowerCase();

    if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);

    let { code, name } = await DepartmentService.getResetPasswordToken(
        providedEmail
    );
    Email.SendForgotPasswordEmail(name, providedEmail, code);
};

exports.resetPassword = async (req) => {
    let providedEmail = req.body[TableFields.email];
    providedEmail = (providedEmail + "").trim().toLowerCase();

    let { code, newPassword } = req.body;

    if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);
    if (!code) throw new ValidationError(ValidationMsgs.PassResetCodeEmpty);
    if (!newPassword) throw new ValidationError(ValidationMsgs.NewPasswordEmpty);
    
    await DepartmentService.resetPassword(providedEmail,code,newPassword);

};

exports.changePassword = async (req) => {
    let { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        throw new ValidationError(ValidationMsgs.ParametersError);

    let user = await DepartmentService.getUserById(req.Department[TableFields.id])
        .withPassword()
        .withId()
        .execute();
    if (user && (await user.isValidAuth(oldPassword))) {
        if (!user.isValidPassword(newPassword))
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        await DepartmentService.updatePassword( user,newPassword);

    } else throw new ValidationError(ValidationMsgs.OldPasswordIncorrect);
};

exports.deleteAccount = async  (req) => {
    try { 
    
      const department = await DepartmentService.getDepartment(req.Department[TableFields.id]).withBasicInfo().execute();
  
      if (!department) throw new ValidationError(GeneralMsgs.DeptNotFound);
      console.log(department);
  
      await ServiceManager.cascadeDelete(TableNames.Department, department[TableFields.ID]);
  
    } catch (error) {
      console.error("Error deleting department account:", error);
      
    }
};