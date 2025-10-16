const db = require('../db');

exports.saveWorkTime = (req, res) => {
  const { employeeId, date, clockIn, clockOut, timeOfWork, shift, delay, overtime } = req.body;
  
  if (!employeeId || !date) {
    return res.status(400).json({ error: "Employee ID and date are required" });
  }

  db.query(
    'INSERT INTO worktime (emp_id, shift_id, work_date, late_minutes, overtime_minutes, work_hours) VALUES (?, ?, ?, ?, ?, ?)',
    [employeeId, shift || null, date, delay || 0, overtime || 0, timeOfWork || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
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