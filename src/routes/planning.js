const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const db = require('../db');

// --- Planning routes ---
router.delete('/delete', planningController.deleteFromPlanning);
router.post('/save', planningController.savePlanning);
router.get('/', planningController.getPlanning);
router.put('/assignment', planningController.updatePlanningAssignment);
router.delete('/', planningController.deletePlanning);
router.get('/shifts', planningController.getShifts);
router.get('/tasks', planningController.getTasks);

// ✅ UPDATED: Get ALL shifts for a specific employee and date (with custom times)
router.get('/employee-shifts-all/:empId/:date', async (req, res) => {
  const { empId, date } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        p.shift_id, 
        p.task_id, 
        p.plan_date,
        s.start_time,
        s.end_time,
        DATE_FORMAT(p.custom_start_time, '%H:%i') as custom_start_time,
        DATE_FORMAT(p.custom_end_time, '%H:%i') as custom_end_time,
        COALESCE(DATE_FORMAT(p.custom_start_time, '%H:%i'), DATE_FORMAT(s.start_time, '%H:%i')) as effective_start_time,
        COALESCE(DATE_FORMAT(p.custom_end_time, '%H:%i'), DATE_FORMAT(s.end_time, '%H:%i')) as effective_end_time
      FROM planning p
      LEFT JOIN shifts s ON p.shift_id = s.shift_id
      WHERE p.emp_id = ? AND p.plan_date = ?
      ORDER BY s.start_time`,
      [empId, date]
    );

    console.log(`✅ Fetched ALL shifts for employee ${empId} on ${date}:`, rows);
    res.json(rows); 
    
  } catch (err) {
    console.error('❌ Error fetching ALL employee shifts:', err);
    res.status(500).json([]); 
  }
});

// --- Employees for planning ---
router.get('/employees', (req, res) => {
  console.log("🔹 GET /api/planning/employees called");

  db.query('SELECT emp_id, name FROM employees', (err, results) => {
    if (err) {
      console.error("❌ Error fetching employees:", err);
      return res.status(500).json({ message: 'Error fetching employees' });
    }

    console.log("✅ Employees fetched for planning:", results);
    res.json(results);
  });
});

// ✅ UPDATED: Get a single shift for a specific employee and date (with custom times)
router.get('/employee-shift/:empId/:date', async (req, res) => {
  const { empId, date } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        p.shift_id,
        s.start_time,
        s.end_time,
        DATE_FORMAT(p.custom_start_time, '%H:%i') as custom_start_time,
        DATE_FORMAT(p.custom_end_time, '%H:%i') as custom_end_time,
        COALESCE(DATE_FORMAT(p.custom_start_time, '%H:%i'), DATE_FORMAT(s.start_time, '%H:%i')) as effective_start_time,
        COALESCE(DATE_FORMAT(p.custom_end_time, '%H:%i'), DATE_FORMAT(s.end_time, '%H:%i')) as effective_end_time
      FROM planning p
      LEFT JOIN shifts s ON p.shift_id = s.shift_id
      WHERE p.emp_id = ? AND p.plan_date = ?
      LIMIT 1`,
      [empId, date]
    );

    if (rows.length > 0) {
      res.json(rows[0]); // Found shift with custom times
    } else {
      res.json({}); // No shift found
    }
  } catch (err) {
    console.error('❌ Error fetching employee shift:', err);
    res.status(500).json({ message: 'Error fetching shift' });
  }
});

console.log("📦 PLANNING ROUTES LOADED");

module.exports = router;