const db = require("../db"); // your MySQL connection (regular mysql2, not promise)

// Get advance by employee ID
exports.getAdvanceByEmployee = (req, res) => {
  const emp_id = req.params.emp_id;
  const { start, end } = req.query;
  
  if (!emp_id) {
    return res.status(400).json({ success: false, message: "Employee ID required" });
  }

  let query = `SELECT * FROM advances WHERE emp_id = ?`;
  let params = [emp_id];
  
  // If date range provided, filter by it
  if (start && end) {
    query += ` AND Advances_date BETWEEN ? AND ?`;
    params.push(start, end);
  }
  
  db.query(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(rows); // Return array of advances
  });
};

// Save a new advance
exports.createAdvance = (req, res) => {
  const { emp_id, amount, date, reason } = req.body;
  if (!emp_id || !amount || !date || !reason) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  db.query(
    `INSERT INTO advances (emp_id, Advances_amount, Advances_date, Advances_reason) VALUES (?, ?, ?, ?)`,
    [emp_id, amount, date, reason],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, Advances_id: result.insertId });
    }
  );
};

// Delete an advance by employee ID
exports.deleteAdvance = (req, res) => {
  const emp_id = req.params.emp_id;
  if (!emp_id) {
    return res.status(400).json({ success: false, message: "Employee ID required" });
  }

  db.query(`DELETE FROM advances WHERE emp_id = ?`, [emp_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true });
  });
};