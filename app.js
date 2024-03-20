const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = 1030
const routes = require("./routes/routes");
const authroutes = require("./routes/auth");

const app = express();
const cors_options = {
    origin:true,
    credentials:true,
    optionSuccessStatus:200
}

//middlewares
app.use(cors(cors_options));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("", routes);
app.use("", authroutes);

app.listen(port, () => {
    console.log("the app is running on port" + port);
})