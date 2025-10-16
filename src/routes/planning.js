const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');

router.post('/planning/save', planningController.savePlanning);
router.get('/planning', planningController.getPlanning);
router.put('/planning/assignment', planningController.updatePlanningAssignment);
router.delete('/planning', planningController.deletePlanning);
router.get('/planning/shifts', planningController.getShifts);
router.get('/planning/tasks', planningController.getTasks);

module.exports = router;