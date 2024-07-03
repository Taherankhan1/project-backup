const FireFighterService = require("../../db/services/FireFighterService");
const FillStationService = require("../../db/services/FillStationService");
const CylinderService = require("../../db/services/CylinderService");
const DepartmentService = require("../../db/services/DepartmentService");
const {
    TableFields,
    GeneralMsgs
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

/*---------------------------------
--------Department Default----------
-----------------------------------*/

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

