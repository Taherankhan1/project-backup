const FillStationService = require("../../db/services/FillStationService");
const CylinderService = require("../../db/services/CylinderService");
const ServiceManager = require("../../db/serviceManager");
const {
    TableFields,
    TableNames,
    GeneralMsgs
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");


/***-----------------------------------
--------Department fill station--------
------------------------------------***/

exports.addFillStation = async (req) => {
    await FillStationService.insertFillStationRecord(req.body, req);

};

exports.getAllFillStation = async (req) => {
    const { sortBy, limit, skip } = req.query;
    let fillstations = await FillStationService.getAllFillStationsByDepartment(sortBy,limit,skip,req.Department[TableFields.id])
        .WithCreatedBy()
        .withUserType()
        .withBasicInfo()
        .execute();
    return fillstations
};

exports.getFillStationById = async (req) => {
    
    let FillStation = await FillStationService.getFillStationById(req.params[TableFields.id].trim()).execute();
    if (!FillStation) throw new ValidationError(GeneralMsgs.StatioNotFound);

    return FillStation;
};

exports.updateFillStation = async(req) =>{
    let fillStation = await FillStationService.getFillStationById(req.params[TableFields.id]).execute();
    if (!fillStation) throw new ValidationError(GeneralMsgs.StatioNotFound);

    let departmentId = fillStation.createdBy[TableFields.ID];
    if (!departmentId) {
        throw new ValidationError(GeneralMsgs.DeptNotFound);
      }
    if (departmentId.toString() !== req.Department.id.toString())
      throw new ValidationError(GeneralMsgs.unauthorizedToEdit);
  
    const updateFillStation = await FillStationService.updateFillStation(fillStation[TableFields.ID],req.body).execute();
    CylinderService.updateCreatedBy(updateFillStation).execute();

};

exports.deleteFillStation = async function (req, res) {
    try {
       
      let station = await FillStationService.getFillStationById(req.params[TableFields.id])
      .WithCreatedBy()
      .execute();
      if (!station) throw new ValidationError(GeneralMsgs.StatioNotFound);

      let departmentId = station.createdBy[TableFields.ID];
      if (!departmentId) {
        throw new ValidationError(GeneralMsgs.DeptNotFound);
      }
      if (departmentId.toString() !== req.Department.id.toString())
        throw new ValidationError(GeneralMsgs.unauthorized);

      await ServiceManager.cascadeDelete(TableNames.FillStation, station[TableFields.ID]);
     } catch (error) {
     throw error
     }
};

