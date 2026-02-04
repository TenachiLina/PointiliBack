const db = require("../db"); // your MySQL connection

// Save a new advance
exports.createAdvance = async (req, res) => {
  const { emp_id, amount, date, reason } = req.body;
  if (!emp_id || !amount || !date || !reason) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO advances (emp_id, Advances_amount, Advances_date, Advances_reason) VALUES (?, ?, ?, ?)`,
      [emp_id, amount, date, reason]
    );

    res.json({ success: true, Advances_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete an advance by employee ID
exports.deleteAdvance = async (req, res) => {
  const emp_id = req.params.emp_id;
  if (!emp_id) {
    return res.status(400).json({ success: false, message: "Employee ID required" });
  }

  try {
    await db.query(`DELETE FROM advances WHERE emp_id = ?`, [emp_id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
