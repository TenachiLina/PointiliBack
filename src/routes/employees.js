const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeesController');

router.get('/', employeesController.getEmployees);
router.post('/', employeesController.addEmployee);
router.delete('/:id', employeesController.deleteEmployee);



module.exports = router;
