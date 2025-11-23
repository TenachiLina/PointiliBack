const db = require('../db');
const multer = require('multer');
const upload = multer();

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
// exports.deleteEmployee = async (req, res) => {
//   const { id } = req.params;
//   console.log("🔧 Deleting employee with ID:", id);

//   // ✅ All tables related to employees
//   const relatedTables = [
//     "planning",
//     "worktime",
//     "salary",
//     "reward",
//     "penalities",
//     "consomation",
//     "advances",
//   ];

//   try {
//     // ✅ Start transaction
//     await new Promise((resolve, reject) => {
//       db.beginTransaction(err => (err ? reject(err) : resolve()));
//     });

//     // ✅ Delete from related tables first
//     for (const table of relatedTables) {
//       await new Promise((resolve, reject) => {
//         db.query(`DELETE FROM ${table} WHERE emp_id = ?`, [id], (err) => {
//           if (err) {
//             console.error(`❌ Error deleting from ${table}:`, err.message);
//             return reject(err);
//           }
//           console.log(`🧹 Deleted records from ${table}`);
//           resolve();
//         });
//       });
//     }

//     // ✅ Delete employee record
//     const result = await new Promise((resolve, reject) => {
//       db.query("DELETE FROM employees WHERE emp_id = ?", [id], (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       });
//     });

//     // ✅ Handle not found
//     if (result.affectedRows === 0) {
//       await new Promise((resolve) => db.rollback(() => resolve()));
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     // ✅ Commit if all good
//     await new Promise((resolve, reject) => {
//       db.commit(err => (err ? reject(err) : resolve()));
//     });

//     console.log("✅ Employee and related records deleted successfully");
//     res.json({ message: "✅ Employee deleted successfully" });

//   } catch (err) {
//     console.error("❌ Error deleting employee:", err);
//     await new Promise((resolve) => db.rollback(() => resolve()));
//     res.status(500).json({
//       error: "Failed to delete employee. Check related tables or constraints.",
//       details: err.message,
//     });
//   }
// };

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  console.log("🔧 Deleting employee with ID:", id);

  // Tables with foreign key dependencies
  const relatedTables = ["planning", "worktime"];

  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction(err => (err ? reject(err) : resolve()));
    });

    // Delete from related tables first
    for (const table of relatedTables) {
      await new Promise((resolve, reject) => {
        db.query(`DELETE FROM ${table} WHERE emp_id = ?`, [id], (err) => {
          if (err) {
            console.error(`❌ Error deleting from ${table}:`, err.message);
            return reject(err);
          }
          console.log(`🧹 Deleted records from ${table}`);
          resolve();
        });
      });
    }

    // Delete the employee record
    const result = await new Promise((resolve, reject) => {
      db.query("DELETE FROM employees WHERE emp_id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Employee not found
    if (result.affectedRows === 0) {
      await new Promise((resolve) => db.rollback(() => resolve()));
      return res.status(404).json({ error: "Employee not found" });
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.commit(err => (err ? reject(err) : resolve()));
    });

    console.log("✅ Employee and related records deleted successfully");
    res.json({ message: "✅ Employee deleted successfully" });

  } catch (err) {
    console.error("❌ Error deleting employee:", err);
    // Rollback transaction
    await new Promise((resolve) => db.rollback(() => resolve()));
    res.status(500).json({
      error: "Failed to delete employee. Check related tables or constraints.",
      details: err.message,
    });
  }
};
exports.addEmployee = (req, res) => {
  const {
    name,
    Total_hours,
    Base_salary,
    address,
    phone_number
  } = req.body;

  const personal_image = req.file ? req.file.buffer : null;

  if (!name || !Total_hours || !Base_salary) {
    return res.status(400).json({ error: "name, Total_hours, Base_salary required" });
  }

  const sql = `
    INSERT INTO employees (name, personal_image, address, phone_number, Total_hours, Base_salary)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, personal_image, address, phone_number, Total_hours, Base_salary], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Employee added", id: result.insertId });
  });
};

exports.updateEmployee = (req, res) => {
  const { id } = req.params;
  const { name, Total_hours, Base_salary, address, phone_number } = req.body;
  const personal_image = req.file ? req.file.buffer : null;

  let sql = `
    UPDATE employees 
    SET name=?, Total_hours=?, Base_salary=?, address=?, phone_number=?
    ${personal_image ? ", personal_image=?" : ""}
    WHERE emp_id=?
  `;

  const params = personal_image
    ? [name, Total_hours, Base_salary, address, phone_number, personal_image, id]
    : [name, Total_hours, Base_salary, address, phone_number, id];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Employee not found" });

    res.json({ message: "✅ Employee updated successfully" });
  });
};







// exports.addEmployee = (req, res) => {
//   const { name } = req.body;
//   if (!name) return res.status(400).json({ error: "Name is required" });

//   db.query('INSERT INTO employees (name) VALUES (?)', [name], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "✅ Employee added", id: result.insertId });
//   });
// };

//test de pushhhhhhhhhhh
//encooooooooreeeeeeeeeeeeeeerrrrrr
// encorrrreeeeeeeeeeeeee
//again
//hahaha