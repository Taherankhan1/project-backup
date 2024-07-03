const express = require("express");
const DBController = require("./db/mongoose");
const cors = require("cors");
const app = express();
const Util = require("./utils/util");

app.use(cors());
app.use(express.urlencoded({extended: false, limit: "5gb", parameterLimit: 50000})); // To parse application/json
app.use(
    express.json({
        limit: "5gb",
    })
); 
app.use(require("./routes/adminRoute"));
app.use(require("./routes/departmentRoute"));
app.use(require("./routes/fireFighterRoute"));

DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, async function () {
        console.log("Server is running on", Util.getBaseURL());
    });
});

