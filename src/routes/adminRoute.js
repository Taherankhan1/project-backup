const API = require("../utils/apiBuilder");
const AdminAuthController =require("../controllers/admin/AdminAuthController");
const AdminDepartmentController = require("../controllers/admin/AdminDepartmentController");
const AdminFireFighterController =require("../controllers/admin/AdminFireFighterController");
const AdminFillStationController=require("../controllers/admin/AdminFillStationController");
const AdminCylinderController=require("../controllers/admin/AdminCylinderController");
/*--------------------------
--------admin auth----------
---------------------------*/

const router = API.configRoute("/admin")
  .addPath("/signup")
  .asPOST(AdminAuthController.addAdminUser)
  .build()

  .addPath("/login")
  .asPOST(AdminAuthController.login)
  .build()

  .addPath("/password/forgot")
  .asPOST(AdminAuthController.forgotPassword)
  .build()

  .addPath("/password/reset")
  .asPOST(AdminAuthController.resetPassword)
  .build()

  .addPath("/password/change")
  .asUPDATE(AdminAuthController.changePassword)
  .useAdminAuth()
  .build()

  .addPath("/logout")
  .asPOST(AdminAuthController.logout)
  .useAdminAuth()
  .build()

  .addPath("/delete")
  .asDELETE(AdminAuthController.deleteAccount)
  .useAdminAuth()
  .build()

/*---------------------------
--------admin department-----
---------------------------*/

  .addPath("/department/add")
  .asPOST(AdminDepartmentController.addDepartmentUser)
  .useAdminAuth()
  .build()

  .addPath("/departments")
  .asGET(AdminDepartmentController.getAllDepartments)
  .useAdminAuth()
  .build()

  .addPath("/department/:id")
  .asGET(AdminDepartmentController.getDepartmentById)
  .useAdminAuth()
  .build()

  .addPath("/department/edit/:id")
  .asUPDATE(AdminDepartmentController.updateDepartment)
  .useAdminAuth()
  .build()
  
  .addPath("/department/delete/:id")
  .asDELETE(AdminDepartmentController.deleteDepartment)
  .useAdminAuth()
  .build()

  /*---------------------------
  -------admin fireFighter-----
  ---------------------------*/

  .addPath("/firefighters")
  .asGET(AdminFireFighterController.getAllFireFighters)
  .useAdminAuth()
  .build()

  .addPath("/firefighter/add")
  .asPOST(AdminFireFighterController.addFireFighterUser)
  .useAdminAuth()
  .build()

  .addPath("/firefighter/:id")
  .asGET(AdminFireFighterController.getFireFighterById)
  .useAdminAuth()
  .build()
  
  .addPath("/firefighter/assigncylinder/:id")
  .asUPDATE(AdminFireFighterController.assignCylinder)
  .useAdminAuth()
  .build()
  
   .addPath("/firefighter/assignedcylinder/:id")
   .asGET(AdminFireFighterController.getAssignedCylinders)
   .useAdminAuth()
   .build()

  .addPath("/firefighter/unassigncylinder/:id")
  .asUPDATE(AdminFireFighterController.unassignCylinder)
  .useAdminAuth()
  .build()

  .addPath("/firefighter/edit/:id")
  .asUPDATE(AdminFireFighterController.updateFireFighter)
  .useAdminAuth()
  .build()

  .addPath("/departmentfighters")
  .asGET(AdminFireFighterController.getAllFireFightersByDepartment)
  .useAdminAuth()
  .build()

  .addPath("/firefighter/delete/:id")
  .asDELETE(AdminFireFighterController.deleteFireFighter)
  .useAdminAuth()
  .build()

  /*---------------------------
  -------admin fill station----
  --------------------------- */

  .addPath("/fillstations")
  .asGET(AdminFillStationController.getAllFillStations)
  .useAdminAuth()
  .build()

  .addPath("/fillstation/add")
  .asPOST(AdminFillStationController.addFillStation)
  .useAdminAuth()
  .build()

  .addPath("/fillstation/:id")
  .asGET(AdminFillStationController.getFillStationById)
  .useAdminAuth()
  .build()

  .addPath("/departmentfillstation")
  .asGET(AdminFillStationController.getAllFillStationsByDepartment)
  .useAdminAuth()
  .build()

  .addPath("/fillstation/edit/:id")
  .asUPDATE(AdminFillStationController.updateFillStation)
  .useAdminAuth()
  .build()

  .addPath("/fillstation/delete/:id")
  .asDELETE(AdminFillStationController.deleteFillStation)
  .useAdminAuth()
  .build()

  /*---------------------------
  --------admin cylinder-------
  ---------------------------*/

  .addPath("/cylinders")
  .asGET(AdminCylinderController.getAllCylinders)
  .useAdminAuth()
  .build()

  .addPath("/cylinders/add")
  .asPOST(AdminCylinderController.addCylinders)
  .useAdminAuth()
  .build()

  .addPath("/cylinder/:id")
  .asGET(AdminCylinderController.getCylinderById)
  .useAdminAuth()
  .build()

  .addPath("/cylinders/unused")
  .asGET(AdminCylinderController.getUnUsedCylinders)
  .useAdminAuth()
  .build()

  .addPath("/cylinders/inuse")
  .asGET(AdminCylinderController.getInUsedCylinders)
  .useAdminAuth()
  .build()

  .addPath("/cylinder/decrease/:id")
  .asUPDATE(AdminCylinderController.decrease)
  .useAdminAuth()
  .build()

  .addPath("/fillstationcylinders")
  .asGET(AdminCylinderController.getAllCylindersByFillStation)
  .useAdminAuth()
  .build()

  .addPath("/cylinder/delete/:id")
  .asDELETE(AdminCylinderController.deleteCylinder)
  .useAdminAuth()
  .build()

  .addPath("/cylinderhistory")
  .asGET(AdminCylinderController.cylinderHistory)
  .useAdminAuth()
  .build()

  .getRouter();

module.exports = router;
