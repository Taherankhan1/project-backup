const UserTypes = (function () {
  function UserTypes() {}
  UserTypes.Admin = 1;
  UserTypes.Department = 2;
  UserTypes.FireFighter = 3;
  UserTypes.FillStation = 4;
  return UserTypes;
})();


const ValidationMsgs = (function () {
    function ValidationMsgs() {}
  ValidationMsgs.InvalidAuthToken = "Invalid Auth token.";
  ValidationMsgs.InvalidPassResetCode = "Invalid password reset token or OTP";
  ValidationMsgs.InvalidAuthToken = "Invalid Auth token.";
  ValidationMsgs.InvalidStationId = "Invalid FillStation Id.";
  ValidationMsgs.InvalidCylinderId = "Invalid cylinder Id.";
  ValidationMsgs.InvalidFireFighterId = "Invalid fireFIghter Id.";
  ValidationMsgs.InvalidDepartmentId = "Invalid department Id.";
  ValidationMsgs.ParametersError = "Invalid parameters.";
  ValidationMsgs.RecordNotFound = "Record not found!";
  ValidationMsgs.AccountAlreadyExists =
  "Registration has already been completed.";
  ValidationMsgs.AccountNotRegistered = "Account not register!.";
  ValidationMsgs.PasswordEmpty = "Password required!";
  ValidationMsgs.EmailInvalid = "Email is invalid";
  ValidationMsgs.QuantityInvalid = "Quantity is invalid";
  ValidationMsgs.NotEnoughRemainingCapacity =
  "ops NotEnoughRemainingCapacity availabe";
  ValidationMsgs.phoneNumberInvalid = "phoneNumber is invalid";
  ValidationMsgs.PasswordInvalid = "Password is invalid";
  ValidationMsgs.AuthFail = "Please authenticate!";
  ValidationMsgs.UnableToLogin = "Incorrect email and/or password";
  ValidationMsgs.UserTypeEmpty = "User type required!";
  ValidationMsgs.NameEmpty = "Name required!";
  ValidationMsgs.QuantityEmpty = "quantity required!";
  ValidationMsgs.InvalidQuantity = "oops ! quantity invalid!";
  ValidationMsgs.QuantityNotAvail = "not enough cylinders for decrease";
  ValidationMsgs.UserIdEmpty = "UserId required!";
  ValidationMsgs.FireFighterIdEmpty = "FirefighterId required!";
  ValidationMsgs.StationIdEmpty = "stationId required!";
  ValidationMsgs.CylinderInUse = "This Cylinder is alrady inuse !";
  ValidationMsgs.CylinderUnUsed = "This Cylinder is alrady unUsed !";
  ValidationMsgs.CylinderNOTfound = "Ops Cylinder  not Found !";
  ValidationMsgs.CylinderDeleted = "This Cylinder is deleted !";
  ValidationMsgs.CylinderIdEmpty = "CylinderId required!";
  ValidationMsgs.EmailEmpty = "Email required!";
  ValidationMsgs.AgeEmpty = "Age required!";
  ValidationMsgs.AgeTooYoung = "sorry age is too young for fireFigter min age is 18";
  ValidationMsgs.AgeTooOld = "sorry age is too old for fireFigter max age is 55";
  ValidationMsgs.AgeEmpty = "Age required!";
  ValidationMsgs.GenderEmpty = "Gender required!";
  ValidationMsgs.GenderInvalid = "Gender value in valid select 1-male 2-female 3-non-binary!";
  ValidationMsgs.phoneNumberUnique =
  "phone number is alrady taken please use differant number";
  ValidationMsgs.DuplicateEmail = "Ops, Duplicate Email!";
  ValidationMsgs.DuplicatePhoneNumber = "Ops, Duplicate phoneNumber or email !";
  ValidationMsgs.PhoneNumberEmpty = "phone number required !";
  ValidationMsgs.serialNoEmpty = "serial number required !";
  ValidationMsgs.AddressEmpty = "address is required !";
  ValidationMsgs.DepartmentIdEmpty = "departmentId is required !";
  ValidationMsgs.FireFighterIdEmpty = "FireFighterId is required !";
  ValidationMsgs.NewPasswordEmpty = "New password required!";
  ValidationMsgs.PassResetCodeEmpty = "Password Reset Code required!";
  ValidationMsgs.OldPasswordIncorrect = "Old password incorrect!";
  ValidationMsgs.AccountIsDeleted = "sorry your account is been deleted";
  
  return ValidationMsgs;
})();

const GeneralMsgs = (function () {
    function GeneralMsgs() {}
    GeneralMsgs.UserNotFound = "sorry user not found .";
    GeneralMsgs.DeptNotFound = "sorry Department not found .";
  GeneralMsgs.FFNotFound = "sorry FireFighter not found .";
  GeneralMsgs.StatioNotFound = "sorry Fill station not found .";
  GeneralMsgs.CylinderNotFound = "sorry Cylinder not found .";
  GeneralMsgs.CylinderNotAssigned = "sorry this cylinder is not assigned you.";
  GeneralMsgs.unauthorized =
  "sorry you are unauthorized person to perform delete";
  GeneralMsgs.unauthorizedToEdit =
    "sorry you are unauthorized person to perform edit operation";

  return GeneralMsgs;
})();
const ResponseMessages = (function () {
    function ResponseMessages() {}
  ResponseMessages.Ok = "Ok";
  ResponseMessages.NotFound = "Data not found!";
  ResponseMessages.signInSuccess = "Sign In successfully!";
  ResponseMessages.signOutSuccess = "Sign Out successfully!";
  return ResponseMessages;
})();


const cylinderDefault_capacity = 195; //in psi

const TableNames = (function () {
  function TableNames() {}
  TableNames.Admin = "admins";
  TableNames.Department = "departments";
  TableNames.FireFighter = "firefighters";
  TableNames.FillStation = "fillstations";
  TableNames.Cylinder = "cylinders";
  TableNames.CylinderHistory = "cylinderHistorys";
  return TableNames;
})();

const InterfaceTypes = (function () {
  function InterfaceType() {}
  InterfaceType.Admin = {
    AdminWeb: "i1",
  };
  InterfaceType.Department = {
    DepartmentWeb: "i2",
  };
  InterfaceType.FireFighter = {
    FireFighterWeb: "i3",
  };
  return InterfaceType;
})();

const Gender = {
  Male: 1,
  Female: 2,
  NonBinary: 3,
};

const TableFields = (function () {
  function TableFields() {}
  TableFields.ID = "_id";
  TableFields.id = "id";
  TableFields.departmentId = "departmentId";
  TableFields.serialNo = "serialNo";
  TableFields.quantity = "quantity";
  TableFields.mfgDate = "mfgDate";
  TableFields.expDate = "expDate";
  TableFields.assignDate = "assignDate";
  TableFields.maxCapacity = "maxCapacity";
  TableFields.remainingCapacity = "remainingCapacity";
  TableFields.unassignDate = "unassignDate";
  TableFields.inUse = "inUse";
  TableFields.fireFighter = "fireFighter";
  TableFields.department = "department";
  TableFields.fillStation = "fillStation";
  TableFields.userId = "userId";
  TableFields.firefighterId = "firefighterId";
  TableFields.fillStationId = "fillStationId";
  TableFields.stationId = "stationId";
  TableFields.cylinderId = "cylinderId";
  TableFields.name_ = "name";
  TableFields.userType = "userType";
  TableFields.countryCode = "countryCode";
  TableFields.phoneNumber = "phoneNumber";
  TableFields.address = "address";
  TableFields.age = "age";
  TableFields.gender = "gender";
  TableFields.passwordResetToken = "passwordResetToken";
  TableFields._createdAt = "createdAt";
  TableFields._updatedAt = "updatedAt";
  TableFields.email = "email";
  TableFields.password = "password";
  TableFields.token = "token";
  TableFields.tokens = "tokens";
  TableFields.approved = "approved";
  TableFields.interface = "interface";
  TableFields.active = "active";
  TableFields.image = "image";
  TableFields.deletedAt = "deletedAt";
  TableFields.isDeleted = "isDeleted";
  TableFields.createdBy = "createdBy";

  return TableFields;
})();

const ResponseStatus = (function () {
  function ResponseStatus() {}
  ResponseStatus.Failed = 0;
  ResponseStatus.Success = 200;
  ResponseStatus.Unauthorized = 401;
  ResponseStatus.NotFound = 404;
  ResponseStatus.UpgradeRequired = 426;
  ResponseStatus.AccountDeactivated = 3001;
  ResponseStatus.InternalServerError = 500;
  ResponseStatus.ServiceUnavailable = 503;
  return ResponseStatus;
})();

module.exports = {
  UserTypes,
  ValidationMsgs,
  TableNames,
  TableFields,
  cylinderDefault_capacity,
  ResponseStatus,
  Gender,
  ResponseMessages,
  InterfaceTypes,
  GeneralMsgs,
};
