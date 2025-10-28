const express = require('express');
const router = express.Router();
const worktimeController = require('../controllers/worktimeController');
const db = require('../db'); // your mysql2 connection

router.get('/monthly', async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT *
             FROM worktime
             WHERE MONTH(work_date) = ? AND YEAR(work_date) = ?
             ORDER BY work_date, shift_id, emp_id`,
            [month, year]
        );

        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching monthly report:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', worktimeController.saveWorkTime);
router.get('/employee/:employeeId', worktimeController.getWorkTimesByEmployee);
router.get('/date/:date', worktimeController.getWorkTimesByDate);
router.put('/:id', worktimeController.updateWorkTime);

module.exports = router;