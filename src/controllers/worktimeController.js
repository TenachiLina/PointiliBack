const db = require('../db');

// backend controller
exports.saveWorkTime = (req, res) => {

const { employeeId, date, timeOfWork, shift, delay, overtime, consomation, penalty, bonus } = req.body;
    console.log("🟢 Incoming work time data:", req.body);

  if (!employeeId || !date) {
    return res.status(400).json({ error: "Employee ID and date are required" });
  }

  const query = `
    INSERT INTO worktime (emp_id, shift_id, work_date, late_minutes, overtime_minutes, work_hours, consomation, penalty, bonus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
  `
  INSERT INTO worktime 
  (emp_id, shift_id, work_date, late_minutes, overtime_minutes, work_hours, consomation, penalty, bonus)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
    employeeId,
    shift || null,
    date,
    delay || "0",
    overtime || "0",
    timeOfWork || "0",
    consomation || "0",
    penalty || "0",
    bonus || "0"
  ],
  (err, result) => {
    if (err) {
  console.error("❌ DB insert error:", err.sqlMessage || err);
  return res.status(500).json({ error: err.sqlMessage || err.message });
}

    res.json({ message: "✅ Work time saved", id: result.insertId });
  }
);

};

// Get work times by employee - FIXED
exports.getWorkTimesByEmployee = (req, res) => {
  const { employeeId } = req.params;

  db.query(
    'SELECT * FROM worktime WHERE emp_id = ? ORDER BY work_date DESC',
    [employeeId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Get work times by date 
exports.getWorkTimesByDate = (req, res) => {
  const { date } = req.params;

  console.log('Fetching worktimes for date:', date);

  const query = `
    SELECT 
      w.worktime_id,
      w.emp_id,
      e.name as emp_name,
      w.shift_id,
      w.work_date,
      w.late_minutes,
      w.overtime_minutes,
      w.work_hours
    FROM worktime w
    INNER JOIN employees e ON w.emp_id = e.emp_id
    WHERE w.work_date = ?
    ORDER BY e.name
  `;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`Found ${results.length} records for date ${date}`);

    if (results.length === 0) {
      return res.status(404).json({
        message: 'No worktime records found for this date',
        date: date
      });
    }

    res.json(results);
  });
};

// Update work time 
exports.updateWorkTime = (req, res) => {
  const { id } = req.params;
  const { clockIn, clockOut, timeOfWork, delay, overtime } = req.body;

  db.query(
    'UPDATE worktime SET work_hours = ?, late_minutes = ?, overtime_minutes = ? WHERE worktime_id = ?',
    [timeOfWork || 0, delay || 0, overtime || 0, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "✅ Work time updated" });
    }
  );
};

// Get worktime report for a range of dates for a specific employee
exports.getWorkTimeReport = (req, res) => {
  const { start, end, empId } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      error: "start and end are required",
    });
  }

  const params = [];
  let whereClause = `
    w.work_date BETWEEN ? AND ?
  `;
  params.push(start, end);

  if (empId) {
    whereClause += " AND w.emp_id = ?";
    params.push(empId);
  }

  const query = `
    SELECT
      w.worktime_id,
      w.emp_id,
      e.name AS emp_name,
      e.Base_salary,
      w.shift_id,
      w.work_date,
      w.late_minutes,
      w.overtime_minutes,
      w.work_hours,
      w.bonus,
      w.penalty,
      w.consomation AS consommation,

      (
        (TIME_TO_SEC(w.work_hours) / 3600) * ((e.Base_salary / 26) / 8)
        + w.bonus
        - w.penalty
        - w.consomation
        - 1
      ) AS salary

    FROM worktime w
    INNER JOIN employees e ON w.emp_id = e.emp_id
    WHERE ${whereClause}
    ORDER BY e.name, w.work_date;
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error in getWorkTimeReport:", err);
      return res.status(500).json({ error: err.message });
    }

    const normalized = results.map((r) => ({
      ...r,
      late_minutes: Number(r.late_minutes || 0),
      overtime_minutes: Number(r.overtime_minutes || 0),
      bonus: Number(r.bonus || 0),
      penalty: Number(r.penalty || 0),
      consommation: Number(r.consommation || 0),
      salary: Number(r.salary || 0),
    }));

    res.json({ rows: normalized });
  });
};
