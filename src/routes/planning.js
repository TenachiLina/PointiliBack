// const express = require('express');
// const router = express.Router();
// const planningController = require('../controllers/planningController');
// const db = require('../db');


// router.post('/planning/save', planningController.savePlanning);
// router.get('/planning', planningController.getPlanning);
// router.put('/planning/assignment', planningController.updatePlanningAssignment);
// router.delete('/planning', planningController.deletePlanning);
// router.get('/planning/shifts', planningController.getShifts);
// router.get('/planning/tasks', planningController.getTasks);



// // GET all employees for planning
// router.get('/', (req, res) => {
//     console.log("🔹 GET /api/planning called");

//     db.query('SELECT emp_id, name FROM employees', (err, results) => {
//         if (err) {
//             console.error("❌ Error fetching employees:", err);
//             return res.status(500).json({ message: 'Error fetching employees' });
//         }

//         console.log("✅ Employees fetched for planning:", results);
//         res.json(results);
//     });
// });



// router.get('/employee-shift/:emp_id/:date', (req, res) => {
//     const { emp_id, date } = req.params;

//     const sql = `
//         SELECT s.shift_id, s.start_time, s.end_time
//         FROM planning p
//         JOIN shifts s ON p.shift_id = s.shift_id
//         WHERE p.emp_id = ? AND p.plan_date = ?
//         LIMIT 1
//     `;

//     db.query(sql, [emp_id, date], (err, rows) => {
//         if (err) {
//             console.error('❌ DB error:', err);
//             return res.status(500).json({ message: 'Error fetching shift' });
//         }

//         if (rows.length > 0) {
//             res.json(rows[0]); // send the planned shift
//         } else {
//             res.status(404).json({ message: 'No planned shift for this employee on this date' });
//         }
//     });
// });



// module.exports = router;



const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const db = require('../db');

// --- Planning routes ---
router.post('/save', planningController.savePlanning);
router.get('/', planningController.getPlanning);
router.put('/assignment', planningController.updatePlanningAssignment);
router.delete('/', planningController.deletePlanning);
router.get('/shifts', planningController.getShifts);
router.get('/tasks', planningController.getTasks);

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



module.exports = router;
