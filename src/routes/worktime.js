const express = require('express');
const router = express.Router();
const worktimeController = require('../controllers/worktimeController');

router.post('/', worktimeController.saveWorkTime);
router.get('/employee/:employeeId', worktimeController.getWorkTimesByEmployee);
router.get('/date/:date', worktimeController.getWorkTimesByDate); 
router.put('/:id', worktimeController.updateWorkTime); 

module.exports = router;