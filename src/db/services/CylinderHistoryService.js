const CylinderHistory = require("../models/cylinderHistory");
const {
  TableFields,
  ApiResponseCode,
  TableNames
} = require("../../utils/constants");
const Util = require("../../utils/util")


const CylinderHistoryService = class {
    static assign = ( cylinder)  => {
        const cylinderid=  cylinder[TableFields.ID]
        const  firefighterid  =cylinder.fireFighter._id
        const  stationid  =cylinder.createdBy._id

        return new ProjectionBuilder(async function () {
            const assignDate = Util.getSystemDateTimeUTC()
            const newAssignCylinder = new CylinderHistory({
              [TableFields.cylinderId]: cylinderid,
              [TableFields.stationId]: stationid,
              [TableFields.firefighterId]: firefighterid,
              [TableFields.assignDate]:assignDate,
            });
          try {
            const  savedCylinders = await CylinderHistory.insertMany(newAssignCylinder);
            return savedCylinders;
          } catch (error) {
            console.error("Error adding cylinders:", error);
            throw error;
          }
        });
      };

      static unassign = (cylinder, fighterID) => {
        const cylinderid=  cylinder[TableFields.ID]
        const unAssignDate = Util.getSystemDateTimeUTC()
        return new ProjectionBuilder(async function () {
            try {
                const updatedCylinders = await CylinderHistory.updateMany(
                    { [TableFields.cylinderId]: cylinderid, [TableFields.firefighterId]: fighterID },
                    { $set: { [TableFields.unassignDate]: unAssignDate } }
                );
                return updatedCylinders;
            } catch (error) {
                console.error("Error updating cylinder history:", error);
                throw error;
            }
        });
      };

};

const ProjectionBuilder = class {
    constructor(methodToExecute) {
      const projection = { populate: {} };
      this.withId = () => {
        projection[TableFields.ID] = 1;
        return this;
      };
      this.withCylinderId = () => {
        projection[TableFields.cylinderId] = 1;
        return this;
      };
      this.withStationId = () => {
        projection[TableFields.stationId] = 1;
        return this;
      };
      this.withFirefighterId = () => {
        projection[TableFields.firefighterId] = 1;
        return this;
      };
      this.withAssignDate = () => {
        projection[TableFields.assignDate] = 1;
        return this;
      };
      this.withUnassignDate = () => {
        projection[TableFields.unassignDate] = 1;
        return this;
      };
      this.execute = async () => {
        if (Object.keys(projection.populate) == 0) {
          delete projection.populate;
        } else {
          projection.populate = Object.values(projection.populate);
        }
        return await methodToExecute.call(projection);
      };
    }
  };
  
module.exports = CylinderHistoryService;
