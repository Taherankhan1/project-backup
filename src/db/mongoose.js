const mongoose = require("mongoose");
mongoose.connection.on("connected", () => {
    console.log("Database Connection Established");
});
mongoose.connection.on("reconnected", () => {
    console.log("Database Connection Reestablished");
});
mongoose.connection.on("disconnected", () => {
    console.log("Database Connection Disconnected");
});
mongoose.connection.on("close", () => {
    console.log("Database Connection Closed");
});
mongoose.connection.on("error", (error) => {
    console.log("Database ERROR: " + error);
});


const initConnection = (callback) => {
    mongoose.connect(process.env.Database_URL, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false, // It will stop displaying deprecation warnings.
    });
    // mongoose.set('debug', true);
    var db = mongoose.connection;
    db.once("open", function () {
        callback();
    });
};
module.exports = {
    initConnection,
    mongoose,
};
