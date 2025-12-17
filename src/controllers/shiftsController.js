const db = require('../db');

module.exports = {
  // GET ALL SHIFTS
  getShifts: (req, res) => {
    db.query("SELECT * FROM shifts ORDER BY shift_id ASC", (err, results) => {
      if (err) {
        console.error("Error fetching shifts:", err);
        return res.status(500).json({ error: "Failed to fetch shifts" });
      }
      res.json(results);
    });
  },

  // ADD NEW SHIFT
  addShift: (req, res) => {
    const { start_time, end_time } = req.body;

    db.query(
      "INSERT INTO shifts (start_time, end_time) VALUES (?, ?)",
      [start_time, end_time],
      (err, result) => {
        if (err) {
          console.error("Error adding shift:", err);
          return res.status(500).json({ error: "Failed to add shift" });
        }

        // Fetch and return newly inserted shift
        db.query(
          "SELECT * FROM shifts WHERE shift_id = ?",
          [result.insertId],
          (err2, rows) => {
            if (err2) {
              console.error("Error fetching newly created shift:", err2);
              return res.status(500).json({ error: "Failed to fetch new shift" });
            }
            res.json(rows[0]);
          }
        );
      }
    );
  },

  // UPDATE SHIFT
  updateShift: (req, res) => {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    db.query(
      "UPDATE shifts SET start_time = ?, end_time = ? WHERE shift_id = ?",
      [start_time, end_time, id],
      (err) => {
        if (err) {
          console.error("Error updating shift:", err);
          return res.status(500).json({ error: "Failed to update shift" });
        }

        db.query("SELECT * FROM shifts WHERE shift_id = ?", [id], (err2, rows) => {
          if (err2) {
            console.error("Error fetching updated shift:", err2);
            return res.status(500).json({ error: "Failed to fetch updated shift" });
          }
          res.json(rows[0]);
        });
      }
    );
  },

  // DELETE SHIFT
  deleteShift: (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM shifts WHERE shift_id = ?", [id], (err) => {
      if (err) {
        console.error("Error deleting shift:", err);
        return res.status(500).json({ error: "Failed to delete shift" });
      }

      res.json({ message: "Shift deleted successfully" });
    });
  },
};
