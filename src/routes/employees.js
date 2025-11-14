const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeesController');

// ✅ Add multer to handle image upload
const multer = require("multer");
const upload = multer(); // stores uploaded file in memory (buffer)

router.get('/', employeesController.getEmployees);

// ✅ Apply multer to POST route
router.post('/', upload.single("personal_image"), employeesController.addEmployee);

router.delete('/:id', employeesController.deleteEmployee);

//NEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
router.put('/:id', upload.single("personal_image"), employeesController.updateEmployee);
//NEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW

module.exports = router;

