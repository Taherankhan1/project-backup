const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const departmentAuth = require("../middleware/departmentAuth"); 
const fireFighterAuth = require("../middleware/fireFighterAuth")
const Util = require("../utils/util");
const { ResponseStatus } = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");

class API {
  static configRoute(root) {
    let router = new express.Router();
    return new PathBuilder(root, router);
  }
}

const MethodBuilder = class {
  constructor(root, subPath, router) {
    this.asGET = function (methodToExecute) {
      return new Builder("get", root, subPath, methodToExecute, router);
    };
    this.asPOST = function (methodToExecute) {
      return new Builder("post", root, subPath, methodToExecute, router);
    };

    this.asDELETE = function (methodToExecute) {
      return new Builder("delete", root, subPath, methodToExecute, router);
    };

    this.asUPDATE = function (methodToExecute) {
      return new Builder("patch", root, subPath, methodToExecute, router);
    };
  }
};

const PathBuilder = class {
  constructor(root, router) {
    this.addPath = function (subPath) {
      return new MethodBuilder(root, subPath, router);
    };
    this.getRouter = () => {
      return router;
    };
    this.changeRoot = (newRoot) => {
      root = newRoot;
      return this;
    };
  }
};

const Builder = class {
  constructor(
    methodType,
    root,
    subPath,
    executer,
    router,
    useAuthMiddleware,
    duplicateErrorHandler,
    middlewaresList = [],
    useAdminAuth = false,
  ) {
    this.useAdminAuth = () => {
      return new Builder(
        methodType,
        root,
        subPath,
        executer,
        router,
        true,
        duplicateErrorHandler,
        middlewaresList,
        true,
      );
    };

    // this.useDepartmentAuth = () => {
    //   return new Builder(
    //     methodType,
    //     root,
    //     subPath,
    //     executer,
    //     router,
    //     false,
    //     duplicateErrorHandler,
    //     middlewaresList,
    //     false,
    //     true,
    //     false
    //   );
    // };
   
    // this.useFireFighterAuth = () => {
    //   return new Builder(
    //     methodType,
    //     root,
    //     subPath,
    //     executer,
    //     router,
    //     false,
    //     duplicateErrorHandler,
    //     middlewaresList,
    //     false,
    //     false,
    //     true
    //   );
    // };

    this.setDuplicateErrorHandler = (mDuplicateErrorHandler) => {
      return new Builder(
        methodType,
        root,
        subPath,
        executer,
        router,
        useAuthMiddleware,
        mDuplicateErrorHandler,
        middlewaresList,
        useAdminAuth,
      );
    };

    this.userMiddlewares = (...middlewares) => {
      middlewaresList = [...middlewares];
      return new Builder(
        methodType,
        root,
        subPath,
        executer,
        router,
        useAuthMiddleware,
        duplicateErrorHandler,
        middlewaresList,
        useAdminAuth,
        // useSocketAPIAuth
      );
    };

    this.build = () => {
      let controller = async (req, res) => {
        try {
          let response = await executer(req, res);
          res.status(ResponseStatus.Success).send(response);
        } catch (e) {
          if (e && duplicateErrorHandler) {
            res.status(ResponseStatus.InternalServerError).send(
              Util.getErrorMessageFromString(duplicateErrorHandler(e))
            );
          } else {
            if (e && e.name != ValidationError.name) {
              console.log(e);
            }
            res.status(ResponseStatus.InternalServerError).send(Util.getErrorMessage(e));
          }
        }
      };
      if (useAuthMiddleware) {
        router[methodType](root + subPath, adminAuth, ...middlewaresList, controller);
      } else if (useAdminAuth) {
        router[methodType](root + subPath, adminAuth, ...middlewaresList, controller);
      } else {
        router[methodType](root + subPath, ...middlewaresList, controller);
      }
      return new PathBuilder(root, router);
    };
  }
};

module.exports = API;
