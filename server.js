/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
// const accountRoute = require("./routes/accountRoute");
const errorRoute = require("./routes/errorRoute");
const utilities = require("./utilities/");
// console.log(utilities);
const pool = require('./database/');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

/* ***********************
 * Middleware
 ************************/

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool: require('./database/'),
  }),
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

// Debug session data
// app.use((req, res, next) => {
//   console.log("Session Data:", req.session);
//   next();
// });

// Flash Middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  console.log("res.locals.messages:", res.locals.messages);
  next();
});

app.use(cookieParser());

// Flash message middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT token validation
app.use(utilities.checkJWTToken);

// Populate navigation for all responses
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

// Serve static files
app.use(express.static("public"));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
// Public Routes
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/account", accountRoute);

// Restricted Routes
app.use("/inv", inventoryRoute);

// Test Route
app.get("/account/test", (req, res) => {
  res.send("Account test route is working");
});

// Intentional error route
app.use("/error", errorRoute);

app.get("/test-flash", (req, res) => {
  req.flash("success", "Flash message is working!");
  console.log("Flash message set:", req.flash("success")); // Debug log
  res.redirect("/account/login");
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});


/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message || 'An unknown error occurred.',
    nav: res.locals.nav,
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
