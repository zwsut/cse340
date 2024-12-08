// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const { registationRules, checkRegData, loginRules, checkLoginData } = require('../utilities/account-validation');

// Route for when 'My Account' is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route for register button
router.get("/register", utilities.handleErrors(accountController.buildRegistration));

// Route for account after login
router.get("/account", utilities.checkJWTToken, (req, res) => {
  if (!req.user) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  const title = "My Account";
  res.render("account/account", {
    title,
    nav: res.locals.nav,
    user: req.user,
  });
});

// Route for submitting register form
router.post(
  '/register',
  registationRules(),
  checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  loginRules(),
  checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Routes for updating account information
router.get("/update", utilities.handleErrors(accountController.buildUpdateView));
router.post("/update", utilities.handleErrors(accountController.updateAccount));
router.post("/change-password", utilities.handleErrors(accountController.changePassword));

// Route for logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

module.exports = router;
