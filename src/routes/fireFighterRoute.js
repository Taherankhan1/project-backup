const API = require("../utils/apiBuilder");
const FireFighterController = require("../controllers/firefighter/FireFighterController");
const FireFighterAuthController=require("../controllers/firefighter/FireFighterAuthController")
const FireFighterCylinderController = require("../controllers/firefighter/FireFighterCylinderController")
const fireFighterAuth = require("../middleware/fireFighterAuth");

/*-------------------------------
--------FireFighter auth---------
-------------------------------*/

const router = API.configRoute("/firefighter")
  .addPath("/login")
  .asPOST(FireFighterAuthController.login)
  .build()

  .addPath("/logout")
  .asPOST(FireFighterAuthController.logout)
  .userMiddlewares(fireFighterAuth)
  .build()

  .addPath("/password/forgot")
  .asPOST(FireFighterAuthController.forgotPassword)
  .build()

  .addPath("/password/reset")
  .asPOST(FireFighterAuthController.resetPassword)
  .build()

  .addPath("/password/change")
  .asUPDATE(FireFighterAuthController.changePassword)
  .userMiddlewares(fireFighterAuth)
  .build()

  .addPath("/delete")
  .asDELETE(FireFighterAuthController.deleteAccount)
  .userMiddlewares(fireFighterAuth)
  .build()

/*-------------------------------
--------FireFighter defalut------
--------------------------------*/
  .addPath("/index")
  .asGET(FireFighterController.index)
  .userMiddlewares(fireFighterAuth)
  .build()

  .addPath("/index/edit")
  .asUPDATE(FireFighterController.updateOwnProfile)
  .userMiddlewares(fireFighterAuth)
  .build()

  /*----------------------------------
  --------FireFighter cylinder--------
  ----------------------------------*/

  .addPath("/getassign")
  .asGET(FireFighterCylinderController.assigned)
  .userMiddlewares(fireFighterAuth)
  .build()
  
  .addPath("/decreasecylinder/:id")
  .asUPDATE(FireFighterCylinderController.decrease)
  .userMiddlewares(fireFighterAuth)
  .build()

  .addPath("/unassigncylinder/:id")
  .asUPDATE(FireFighterCylinderController.unassignCylinder)
  .userMiddlewares(fireFighterAuth)
  .build()

  .getRouter();

module.exports = router;
