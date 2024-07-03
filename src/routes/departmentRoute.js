const API = require("../utils/apiBuilder");
const DepartmentController = require("../controllers/department/DepartmentController");
const DepartmentAuthController=require("../controllers/department/DepartmentAuthController")
const DepartmentFireFighterController = require("../controllers/department/DepartmentFireFighterController");
const DepartmentFillStationController =require("../controllers/department/DepartmentFillStationController");
const DepartmentCylinderController =require("../controllers/department/DepartmentCylinderController");
const departmentAuth = require("../middleware/departmentAuth");

/*------------------------------
--------Department auth---------
------------------------------*/

const router = API.configRoute("/department")
  .addPath("/login")
  .asPOST(DepartmentAuthController.login)
  .build()

  .addPath("/logout")
  .asPOST(DepartmentAuthController.logout)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/password/forgot")
  .asPOST(DepartmentAuthController.forgotPassword)
  .build()

  .addPath("/password/reset")
  .asPOST(DepartmentAuthController.resetPassword)
  .build()

  .addPath("/password/change")
  .asUPDATE(DepartmentAuthController.changePassword)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/delete")
  .asDELETE(DepartmentAuthController.deleteAccount)
  .userMiddlewares(departmentAuth)
  .build()

/*------------------------------
------Department Default--------
-------------------------------*/

.addPath("/index")
.asGET(DepartmentController.index)
.userMiddlewares(departmentAuth)
.build()

.addPath("/index/edit")
.asUPDATE(DepartmentController.updateOwnProfile)
.userMiddlewares(departmentAuth)
.build()


/***-----------------------------------
--------Department firefighter-------
------------------------------------***/

  .addPath("/firefighter/add")
  .asPOST(DepartmentFireFighterController.addFireFighterUser)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/firefighters")
  .asGET(DepartmentFireFighterController.getAllFireFighter)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/firefighter/:id")
  .asGET(DepartmentFireFighterController.getFireFighterById)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/firefighter/edit/:id")
  .asUPDATE(DepartmentFireFighterController.updateFireFighter)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/firefighter/assigncylinder/:id")
  .asUPDATE(DepartmentFireFighterController.assignCylinder)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/firefighter/unassigncylinder/:id")
  .asUPDATE(DepartmentFireFighterController.unassignCylinder)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/firefighter/delete/:id")
  .asDELETE(DepartmentFireFighterController.deleteFireFighter)
  .userMiddlewares(departmentAuth)
  .build()

  /***-----------------------------------
--------Department FillStation-------
------------------------------------***/

  .addPath("/fillstation/add")
  .asPOST(DepartmentFillStationController.addFillStation)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstations")
  .asGET(DepartmentFillStationController.getAllFillStation)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstation/:id")
  .asGET(DepartmentFillStationController.getFillStationById)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstation/edit/:id")
  .asUPDATE(DepartmentFillStationController.updateFillStation)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstation/delete/:id")
  .asDELETE(DepartmentFillStationController.deleteFillStation)
  .userMiddlewares(departmentAuth)
  .build()

  /***-----------------------------------
----------Department Cylinder----------
------------------------------------***/

  .addPath("/cylinders")
  .asGET(DepartmentCylinderController.getAllCylinders)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstation/cylinders/add")
  .asPOST(DepartmentCylinderController.addCylinders)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstation/cylinders/:id")
  .asGET(DepartmentCylinderController.getAllCylindersFromStation)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/fillstation/cylinder/:id")
  .asGET(DepartmentCylinderController.getCylinderById)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/cylinders/unused")
  .asGET(DepartmentCylinderController.getUnUsedCylinders)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/cylinders/inuse")
  .asGET(DepartmentCylinderController.getInUsedCylinders)
  .userMiddlewares(departmentAuth)
  .build()

  .addPath("/cylinder/delete/:id")
  .asDELETE(DepartmentCylinderController.deleteCylinder)
  .userMiddlewares(departmentAuth)
  .build()

  .getRouter();

module.exports = router;
