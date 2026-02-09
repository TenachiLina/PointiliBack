const express = require("express");
const router = express.Router();
const advancesController = require("../controllers/advancesController");

// GET -> Get advances by employee ID
router.get("/:emp_id", advancesController.getAdvanceByEmployee);

// POST -> Create advance
router.post("/", advancesController.createAdvance);

// DELETE -> Delete advance by employee ID
router.delete("/:emp_id", advancesController.deleteAdvance);

module.exports = router;