const db = require('../db');

// backend controller
exports.saveWorkTime = (req, res) => {
  const { employeeId, date, clockIn, clockOut, timeOfWork, shift, delay, overtime, consomation, penalty, absent, absentComment } = req.body;
  console.log("🟢 Incoming work time data:", req.body);

  if (!employeeId || !date || !shift) {
    return res.status(400).json({ error: "Employee ID, date, and shift are required" });
  }

  // Convert time strings to proper format
  const formatTimeValue = (timeStr) => {
    if (!timeStr || timeStr === "0") return "00:00:00";
    if (timeStr.match(/^\d{1,2}:\d{2}$/)) return `${timeStr}:00`;
    if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) return timeStr;
    return "00:00:00";
  };

  // First check if record exists
  db.query(
    `SELECT worktime_id FROM worktime WHERE emp_id = ? AND work_date = ? AND shift_id = ?`,
    [employeeId, date, shift],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error("❌ DB check error:", checkErr.sqlMessage || checkErr);
        return res.status(500).json({ error: checkErr.sqlMessage || checkErr.message });
      }

      if (checkResults.length > 0) {
        // Record exists - UPDATE
        console.log("📝 Updating existing worktime record ID:", checkResults[0].worktime_id);

        db.query(
          `
UPDATE worktime 
SET late_minutes = ?, 
    overtime_minutes = ?, 
    work_hours = ?, 
    consomation = ?, 
    penalty = ?, 
    absent = ?, 
    absent_comment = ?,
    clock_in = ?,
    clock_out = ?
WHERE emp_id = ? AND work_date = ? AND shift_id = ?
`,
          [
            formatTimeValue(delay),
            formatTimeValue(overtime),
            formatTimeValue(timeOfWork),
            consomation || 0,
            penalty || 0,
            absent ? 1 : 0,
            absentComment || "",
            formatTimeValue(clockIn),
            formatTimeValue(clockOut),
            employeeId,
            date,
            shift
          ],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("❌ DB update error:", updateErr.sqlMessage || updateErr);
              return res.status(500).json({ error: updateErr.sqlMessage || updateErr.message });
            }

            console.log("✅ Work time updated successfully");
            res.json({
              message: "✅ Work time updated",
              id: checkResults[0].worktime_id,
              action: 'updated'
            });
          }
        );
      } else {
        // Record doesn't exist - INSERT
        console.log("➕ Inserting new worktime record for emp:", employeeId, "shift:", shift, "date:", date);

        db.query(
          `
INSERT INTO worktime 
(emp_id, shift_id, work_date, late_minutes, overtime_minutes, work_hours, consomation, penalty, absent, absent_comment, clock_in, clock_out)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
          [
            employeeId,
            shift,
            date,
            formatTimeValue(delay),
            formatTimeValue(overtime),
            formatTimeValue(timeOfWork),
            consomation || 0,
            penalty || 0,
            absent ? 1 : 0,
            absentComment || "",
            formatTimeValue(clockIn),
            formatTimeValue(clockOut)
          ],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("❌ DB insert error:", insertErr.sqlMessage || insertErr);
              return res.status(500).json({ error: insertErr.sqlMessage || insertErr.message });
            }

            console.log("✅ Work time saved successfully, ID:", insertResult.insertId);
            res.json({
              message: "✅ Work time saved",
              id: insertResult.insertId,
              action: 'inserted'
            });
          }
        );
      }
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
    CONCAT(e.FirstName, ' ', e.LastName) as emp_name,
    w.shift_id,
    w.work_date,
    w.clock_in,
    w.clock_out,
    w.late_minutes,
    w.overtime_minutes,
    w.work_hours,
    w.absent,
    w.absent_comment
  FROM worktime w
  INNER JOIN employees e ON w.emp_id = e.emp_id
  WHERE w.work_date = ?
  ORDER BY e.FirstName
`;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`Found ${results.length} records for date ${date}`);

    if (results.length === 0) {
      return res.json([]);
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

// ✅ FIXED: Get worktime report - aggregates multiple shifts per day
exports.getWorkTimeReport = (req, res) => {
  const { start, end, empId } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      error: "start and end are required",
    });
  }

  const params = [];
  let whereClause = `work_date BETWEEN ? AND ?`;

  params.push(start, end);

  if (empId) {
    whereClause += " AND emp_id = ?";
    params.push(empId);
  }

  // ✅ NEW QUERY: Aggregates all shifts per employee per date
  const query = `
    SELECT
      w.emp_id,
      e.Base_salary,
      e.FirstName,
      e.LastName,
      CONCAT(e.FirstName, ' ', e.LastName) AS emp_name,
      w.work_date,
      
      -- Aggregate multiple shifts on same date
      SUM(TIME_TO_SEC(w.work_hours) / 3600) AS work_hours_decimal,
      SEC_TO_TIME(SUM(TIME_TO_SEC(w.work_hours))) AS work_hours,
      SUM(TIME_TO_SEC(w.late_minutes) / 60) AS late_minutes,
      SUM(TIME_TO_SEC(w.overtime_minutes) / 60) AS overtime_minutes,
      SUM(w.penalty) AS penalty,
      SUM(w.consomation) AS consommation,
      MAX(w.absent) AS absent,
      GROUP_CONCAT(DISTINCT w.absent_comment SEPARATOR '; ') AS absent_comment,
      
      -- Calculate salary based on total hours worked across all shifts
      SUM(TIME_TO_SEC(w.work_hours) / 3600) * ((e.Base_salary / 26) / 8) - SUM(w.penalty) - SUM(w.consomation) AS salary
      
    FROM worktime w
    INNER JOIN employees e ON w.emp_id = e.emp_id
    WHERE ${whereClause}
    GROUP BY w.emp_id, w.work_date, e.Base_salary, e.FirstName, e.LastName
    ORDER BY e.FirstName, e.LastName, w.work_date;
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error in getWorkTimeReport:", err);
      return res.status(500).json({ error: err.message });
    }

    const normalized = results.map((r) => ({
      ...r,
      work_hours: r.work_hours || "00:00:00",
      work_hours_decimal: Number(r.work_hours_decimal || 0),
      late_minutes: Number(r.late_minutes || 0),
      overtime_minutes: Number(r.overtime_minutes || 0),
      penalty: Number(r.penalty || 0),
      consommation: Number(r.consommation || 0),
      salary: Number(r.salary || 0),
      absent: Number(r.absent || 0),
      absent_comment: r.absent_comment || "",
    }));

    const summary = normalized.reduce(
      (acc, r) => {
        // Use the pre-calculated decimal hours
        const hoursDecimal = r.work_hours_decimal || 0;

        acc.total_hours += hoursDecimal;
        acc.total_delay_minutes += r.late_minutes;
        acc.total_overtime_minutes += r.overtime_minutes;
        acc.total_penalty += r.penalty;
        acc.total_consommation += r.consommation;
        acc.total_salary += r.salary;

        if (r.absent) acc.count_absent++;
        if (r.late_minutes > 0) acc.count_late++;

        return acc;
      },
      {
        total_hours: 0,
        total_delay_minutes: 0,
        total_overtime_minutes: 0,
        total_penalty: 0,
        total_consommation: 0,
        total_salary: 0,
        count_late: 0,
        count_absent: 0,
      }
    );

    console.log("💰 Salaries per day:", normalized.map(r => ({
      date: r.work_date,
      name: r.emp_name,
      hours: r.work_hours,
      hours_decimal: r.work_hours_decimal,
      salary: r.salary
    })));

    console.log("💵 TOTAL SALARY:", summary.total_salary);

    res.json({ rows: normalized, summary });
  });
};