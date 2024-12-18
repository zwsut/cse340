const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const ReviewModel = require("../models/review-model");


const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      const error = new Error("Vehicle classification not found");
      error.status = 404;
      throw error;
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};


/* ***************************
 *  Build vehicle page by inventory id
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;

    const accountId = req.session?.accountId || null;
    const accountFirstName = req.session?.accountFirstName || "";
    const accountLastName = req.session?.accountLastName || "";
    const screenName =
      accountId && accountFirstName && accountLastName
        ? `${accountFirstName.charAt(0)}${accountLastName}`
        : null;

    const data = await invModel.getDetailByVehicleId(inv_id);
    if (!data) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }

    console.log("Session data in buildByInvId:", req.session);

    const reviews = await ReviewModel.getReviewsByInvId(inv_id);

    const vehicleTemplate = await utilities.buildVehiclePage(data);
    const nav = await utilities.getNav();
    const vehicleName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`;

    console.log("Rendering vehicle page with:", {
      loggedIn: !!req.session.accountId,
      accountName: req.session.accountName,
      accountId: req.session.accountId,
    });

    res.render("./inventory/vehicle", {
      title: vehicleName,
      nav,
      vehicleTemplate,
      reviews,
      accountId,
      screenName,
      accountName: req.session.accountName || "",
      inv_id,
      inventoryId: inv_id,
      loggedIn: !!req.session.accountId,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildByInvId:", error);
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


module.exports = invCont