const db = require('../db');

exports.getEmployees = (req, res) => {
  console.log('🔹 GET /api/employees called'); // Add this
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error('❌ DB error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Employees fetched:', results);
    res.json(results);
  });
};


exports.deleteEmployee = (req, res) => {
  const { id } = req.params;
  console.log('🔧 Deleting employee with ID:', id);

  db.query('DELETE FROM employees WHERE emp_id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log('✅ Employee deleted successfully');
    res.json({ message: "✅ Employee deleted successfully" });
  });
};
exports.addEmployee = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  db.query('INSERT INTO employees (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Employee added", id: result.insertId });
  });
};

//test de pushhhhhhhhhhh
//encooooooooreeeeeeeeeeeeeeerrrrrr
// encorrrreeeeeeeeeeeeee
//again
//hahaha