const express = require("express");
const router = express.Router();
const shiftsController = require("../controllers/shiftsController");

router.get("/", shiftsController.getShifts);
router.post("/", shiftsController.addShift);
router.put("/:id", shiftsController.updateShift);
router.delete("/:id", shiftsController.deleteShift);

module.exports = router;
