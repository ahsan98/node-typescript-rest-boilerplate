import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";
import requireDir from "require-dir";
import path from "path";
import passportConfig from './config/passport';
import { ResponseHandler } from "./classes/ResponseHandler";
import { StatusCode } from "./enums/status-codes.enum";

// Initialize passport configurations
passportConfig(passport);
// Create Express server
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(lusca.xssProtection(true));

const routes = requireDir("routes/api", { recurse: true });
for (const i in routes) {
  app.use("/api/v1", routes[i]);
}

// throw 404 if URL not found
app.all("*", function (req, res) {
	return ResponseHandler.makeResponse(res, StatusCode.NOT_FOUND, false, null, 'Page not found')
});

export default app;