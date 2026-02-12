const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const db = require('../db');

// --- Planning routes ---
// ✅ NEW DELETE ROUTE
router.delete('/delete', planningController.deleteFromPlanning);


router.post('/save', planningController.savePlanning);
router.get('/', planningController.getPlanning);
router.put('/assignment', planningController.updatePlanningAssignment);
router.delete('/', planningController.deletePlanning);
router.get('/shifts', planningController.getShifts);
router.get('/tasks', planningController.getTasks);

// --- In your planning router file (e.g., /routes/planningRoutes.js) ---

// ... (existing routes)

// 🆕 NEW: Add this route to get ALL shifts for a specific employee and date
router.get('/employee-shifts-all/:empId/:date', async (req, res) => {
    const { empId, date } = req.params;

    try {
        // Use db.promise() for async/await pattern
        const [rows] = await db.promise().query(
            // Select all relevant planning columns, as the frontend expects an array of shift objects
            'SELECT shift_id, task_id, plan_date FROM planning WHERE emp_id = ? AND plan_date = ?',
            [empId, date]
        );

        // The frontend expects an array of shift objects (even if it's empty)
        // If the query succeeds, 'rows' is the array of shifts/assignments.
        console.log(`✅ Fetched ALL shifts for employee ${empId} on ${date}:`, rows);
        res.json(rows); 
        
    } catch (err) {
        console.error('❌ Error fetching ALL employee shifts:', err);
        // Return an empty array on error to prevent frontend crashes
        res.status(500).json([]); 
    }
});

// ... (rest of the router code)

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

// 🆕 Add this route to get a shift for a specific employee and date
router.get('/employee-shift/:empId/:date', async (req, res) => {
    const { empId, date } = req.params;

    try {
        // Use .promise() here
        const [rows] = await db.promise().query(
            'SELECT shift_id FROM planning WHERE emp_id = ? AND plan_date = ?',
            [empId, date]
        );


        if (rows.length > 0) {
            res.json(rows[0]); // Found shift
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
