const utilities = require("../utilities")
const invModel = require("../models/inventory-model")

/* ****************************************
*  Deliver inv management view
* *************************************** */
async function buildInvManagement(req, res, next) {
    try {
      let nav = await utilities.getNav()

      const classifications = await invModel.getClassifications();
            classifications: classifications.rows,
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        classifications: classifications.rows,
        errors: null,
    })
  } catch(err) {
    next(err)
  }}

/* ****************************************
*  Deliver add-classification view
* *************************************** */
async function buildAddClassification(req, res, next) {
  console.log("build add classification working")
  try {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Inventory Management - Add Classification",
      nav,
      errors: null,
  })
} catch(err) {
  next(err)
}}

/* ****************************************
 *  Process Add Class
 * *************************************** */
async function addClassResult(req, res, next) {
  try {
    const classification_name = req.body.classification_name.trim();

    if (!classification_name || classification_name.length < 3 || !/^[a-zA-Z\s]+$/.test(classification_name)) {
      req.flash(
        "notice",
        "Classification name must be at least 3 characters long and contain only letters."
      );
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav: await utilities.getNav(),
        errors: null,
      });
    }

    const result = await invModel.addClass(classification_name);

    if (result && result.success) {
      req.flash(
        "notice",
        `Congratulations, you've successfully added "${classification_name}".`
      );
      return res.redirect("/inv");
    } else if (result && result.message === "Classification name already exists") {
      req.flash("notice", result.message);
    } else {
      req.flash("notice", "Sorry, adding the classification failed.");
    }

    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      errors: null,
    });
  } catch (err) {
    console.error("Error in addClassResult:", err);
    next(err);
  }
}

async function buildAddInventory(req, res, next) {
  try {
    const classifications = await invModel.getClassifications();
    const nav = await utilities.getNav();

    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications: classifications.rows,
      errors: null,
    });
  } catch (err) {
    console.error("Error in buildAddInventory:", err);
    next(err);
  }
}

const { validationResult } = require("express-validator");

async function addInventoryResult(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const classifications = await invModel.getClassifications();
    const nav = await utilities.getNav();

    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications: classifications.rows,
      errors: errors.array(), // Pass errors to the view
      locals: req.body,       // Pass submitted data back to the template
    });
  }

  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_thumbnail,
      inv_image,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_thumbnail,
      inv_image,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result.success) {
      req.flash("notice", "Inventory added successfully!");
      return res.redirect("/inv");
    } else {
      req.flash("notice", "Failed to add inventory.");
      return res.redirect("/inv/add-inventory");
    }
  } catch (err) {
    console.error("Error in addInventoryResult:", err);
    next(err);
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
async function editInventoryView (req, res, next) {
  console.log("req.params.inv_id:", req.params.inv_id);
  const inv_id = parseInt(req.params.inv_id, 10);
  console.log("2")
  let nav = await utilities.getNav()
  console.log("3")
  const itemData = await invModel.getDetailByVehicleId(inv_id)
  console.log(itemData)
  // const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const classificationSelect = await invModel.getClassifications();
  console.log("classificationSelect:", classificationSelect.rows);
  console.log("5")
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  console.log("6")
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classifications: classificationSelect.rows,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

// Update Inv edit
const updateInventoryResult = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const classifications = await invModel.getClassifications();
    const nav = await utilities.getNav();

    // Render the edit-inventory view with errors and data
    return res.status(400).render("./inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
      nav,
      classifications: classifications.rows,
      errors: errors.array(),
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    });
  }

  try {
    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_thumbnail,
      inv_image,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    // Call the model method to perform the update
    const result = await invModel.updateInventory({
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_thumbnail,
      inv_image,
      inv_price,
      inv_miles,
      inv_color,
    });

    if (result.rowCount > 0) {
      req.flash("notice", "Inventory updated successfully!");
      return res.redirect("/inv");
    } else {
      req.flash("notice", "Failed to update inventory. Please try again.");
      return res.redirect(`/inv/edit/${inv_id}`);
    }
  } catch (err) {
    console.error("Error in updateInventoryResult:", err);
    req.flash("notice", "An error occurred during the update process.");
    res.redirect(`/inv/edit/${req.body.inv_id}`);
  }
};






module.exports = { updateInventoryResult, editInventoryView, buildInvManagement, buildAddClassification, addClassResult, buildAddInventory, addInventoryResult }