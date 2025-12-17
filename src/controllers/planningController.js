const db = require('../db');

exports.savePlanning = (req, res) => {
  const { plan_date, assignments } = req.body;
  console.log("💡 Received body:", req.body);

  if (!plan_date) {
    return res.status(400).json({ error: "Plan date is required" });
  }

  console.log('💾 Saving planning for date:', plan_date);

  db.beginTransaction((err) => {
    if (err) {
      console.error('❌ Transaction error:', err);
      return res.status(500).json({ error: err.message });
    }

    // First, get the actual shift_ids and task_ids from the database
    getShiftAndTaskIds((err, { shifts, tasks }) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      // Validate and transform assignments
      const validAssignments = validateAndTransformAssignments(assignments, shifts, tasks);
      console.log('🧠 Raw assignments:', assignments);
      console.log('🧩 Validation result:', validAssignments);


      if (validAssignments.error) {
        return db.rollback(() => {
          res.status(400).json({ error: validAssignments.error });
        });
      }

      // Delete existing planning for this date
      db.query('DELETE FROM planning WHERE plan_date = ?', [plan_date], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('❌ Delete error:', err);
            res.status(500).json({ error: err.message });
          });
        }

        console.log('✅ Cleared existing planning for date:', plan_date);

        // If no valid assignments, commit empty planning
        if (validAssignments.data.length === 0) {
          return db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('❌ Commit error:', err);
                res.status(500).json({ error: err.message });
              });
            }
            console.log('✅ Planning saved successfully (empty planning)');
            res.json({ message: "✅ Planning saved successfully", date: plan_date, assignments_count: 0 });
          });
        }

        // Insert valid assignments
        const values = validAssignments.data.map(assignment => [
          assignment.shift_id,
          assignment.emp_id,
          assignment.task_id,
          plan_date
        ]);

        console.log('🧩 Values to insert:', values);


        const query = 'INSERT INTO planning (shift_id, emp_id, task_id, plan_date) VALUES ?';

        db.query(query, [values], (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('❌ Insert error:', err);
              res.status(500).json({ error: err.message });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('❌ Commit error:', err);
                res.status(500).json({ error: err.message });
              });
            }

            console.log('✅ Planning saved successfully. Assignments:', result.affectedRows);
            res.json({
              message: "✅ Planning saved successfully",
              date: plan_date,
              assignments_count: result.affectedRows
            });
          });
        });
      });
    });
  });
};

// Helper function to get shift and task IDs from database
function getShiftAndTaskIds(callback) {
  // Get shifts
  db.query('SELECT shift_id, start_time, end_time FROM shifts ORDER BY shift_id', (err, shiftResults) => {
    if (err) return callback(err);

    // Get tasks  
    db.query('SELECT task_id, task_name FROM tasks ORDER BY task_id', (err, taskResults) => {
      if (err) return callback(err);

      callback(null, {
        shifts: shiftResults,
        tasks: taskResults
      });
    });
  });
}

// Helper function to validate and transform assignments
function validateAndTransformAssignments(assignments, shifts, tasks) {
  if (!assignments || assignments.length === 0) {
    return { data: [] };
  }

  const validAssignments = [];
  const errors = [];

  // Create mappings for easier lookup
  const shiftMap = {};
  shifts.forEach(shift => {

    if (shift.shift_id === 1) shiftMap[1] = shift.shift_id;
    if (shift.shift_id === 2) shiftMap[2] = shift.shift_id;
    if (shift.shift_id === 3) shiftMap[3] = shift.shift_id;
  });

  const taskMap = {};
  tasks.forEach(task => {
    // Map task names to IDs
    const taskName = task.task_name.toLowerCase();
    if (taskName.includes('pizzaiolo')) taskMap[1] = task.task_id;
    else if (taskName.includes('livreur')) taskMap[2] = task.task_id;
    else if (taskName.includes('agent polyvalent')) taskMap[3] = task.task_id;
    else if (taskName.includes('prepateur')) taskMap[4] = task.task_id;
    else if (taskName.includes('cassier')) taskMap[5] = task.task_id;
    else if (taskName.includes('serveur')) taskMap[6] = task.task_id;
    else if (taskName.includes('plongeur')) taskMap[7] = task.task_id;
    else if (taskName.includes('manageur')) taskMap[8] = task.task_id;
    else if (taskName.includes('packaging')) taskMap[9] = task.task_id;
    else if (taskName.includes('topping')) taskMap[10] = task.task_id;
    else if (taskName.includes('bar')) taskMap[11] = task.task_id;
  });

  assignments.forEach((assignment, index) => {
    if (!assignment.emp_id) return; // Skip if no employee selected

    const actualShiftId = shiftMap[assignment.shift_id];
    const actualTaskId = taskMap[assignment.task_id];

    if (!actualShiftId) {
      errors.push(`Invalid shift_id: ${assignment.shift_id} at position ${index + 1}`);
      return;
    }

    if (!actualTaskId) {
      errors.push(`Invalid task_id: ${assignment.task_id} at position ${index + 1}`);
      return;
    }

    validAssignments.push({
      shift_id: actualShiftId,
      emp_id: assignment.emp_id,
      task_id: actualTaskId
    });
  });

  if (errors.length > 0) {
    return { error: errors.join('; ') };
  }

  return { data: validAssignments };
}

// Get available shifts
exports.getShifts = (req, res) => {
  console.log(' Fetching available shifts');

  db.query('SELECT shift_id, start_time, end_time FROM shifts ORDER BY shift_id', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    const transformedShifts = results.map(shift => ({
      shift_id: shift.shift_id,
      name: `${shift.start_time.toString().split(' ')[4]}-${shift.end_time.toString().split(' ')[4]} (${shift.shift_id})`,
      time: `${shift.start_time.toString().split(' ')[4]}-${shift.end_time.toString().split(' ')[4]}`
    }));

    console.log(' Shifts fetched successfully');
    res.json(transformedShifts);
  });
};

// Get available tasks
exports.getTasks = (req, res) => {
  console.log(' Fetching available tasks');

  db.query('SELECT task_id, task_name FROM tasks ORDER BY task_id', (err, results) => {
    if (err) {
      console.error(' Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    // Transform to match frontend expectations
    const transformedTasks = results.map(task => ({
      task_id: task.task_id,
      name: task.task_name
    }));

    console.log(' Tasks fetched successfully');
    res.json(transformedTasks);
  });
};


// Get planning for a specific date
exports.getPlanning = (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  console.log(' Fetching planning for date:', date);

  const query = `
    SELECT p.*, e.name as employee_name, 
           DATE_FORMAT(s.start_time, '%H:%i') as start_time,
           DATE_FORMAT(s.end_time, '%H:%i') as end_time,
           CONCAT(DATE_FORMAT(s.start_time, '%H:%i'), '-', DATE_FORMAT(s.end_time, '%H:%i')) as shift_time
    FROM planning p
    LEFT JOIN employees e ON p.emp_id = e.emp_id
    LEFT JOIN shifts s ON p.shift_id = s.shift_id
    WHERE p.plan_date = ?
    ORDER BY p.shift_id, p.task_id
  `;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error(' Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(' Planning data fetched successfully. Records:', results.length);
    res.json(results);
  });
};

exports.updatePlanningAssignment = (req, res) => {
  const { shift_id, emp_id, task_id, plan_date, new_emp_id } = req.body;

  if (!shift_id || !task_id || !plan_date) {
    return res.status(400).json({ error: "Shift ID, Task ID, and Plan Date are required" });
  }

  console.log(' Updating planning assignment:', { shift_id, task_id, plan_date, new_emp_id });

  if (!new_emp_id) {
    const query = 'DELETE FROM planning WHERE shift_id = ? AND task_id = ? AND plan_date = ?';
    db.query(query, [shift_id, task_id, plan_date], (err, result) => {
      if (err) {
        console.error(' Delete error:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log(' Assignment removed successfully');
      res.json({ message: " Assignment removed successfully", affectedRows: result.affectedRows });
    });
  } else {
    const query = `
      INSERT INTO planning (shift_id, emp_id, task_id, plan_date) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE emp_id = ?
    `;

    db.query(query, [shift_id, new_emp_id, task_id, plan_date, new_emp_id], (err, result) => {
      if (err) {
        console.error('❌ Update error:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('✅ Assignment updated successfully');
      res.json({ message: "✅ Assignment updated successfully", affectedRows: result.affectedRows });
    });
  }
};

// Delete all planning for a specific date
exports.deletePlanning = (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  console.log(' Deleting planning for date:', date);

  db.query('DELETE FROM planning WHERE plan_date = ?', [date], (err, result) => {
    if (err) {
      console.error(' Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(' Planning deleted successfully. Removed rows:', result.affectedRows);
    res.json({ message: " Planning deleted successfully", deleted_rows: result.affectedRows });
  });
};

// Get available shifts
exports.getShifts = (req, res) => {
  console.log(' Fetching available shifts');

  db.query('SELECT * FROM shifts ORDER BY shift_id', (err, results) => {
    if (err) {
      console.error(' Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(' Shifts fetched successfully');
    res.json(results);
  });
};

// Get available tasks (posts)
exports.getTasks = (req, res) => {
  console.log(' Fetching available tasks');

  db.query('SELECT * FROM tasks ORDER BY task_id', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(' Tasks fetched successfully');
    res.json(results);
  });
};

exports.deleteFromPlanning = (req, res) => {
    const { emp_id, task_id, shift_id, work_date } = req.body;

    if (!emp_id || !task_id || !shift_id || !work_date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const deletePlanningQuery = `
        DELETE FROM planning 
        WHERE emp_id = ? AND task_id = ? AND shift_id = ? AND work_date = ?;
    `;

    // FIX: worktime table does NOT have task_id
    const deleteWorktimeQuery = `
        DELETE FROM worktime
        WHERE emp_id = ?
          AND shift_id = ?
          AND work_date = ?;
    `;

    db.query(deletePlanningQuery, [emp_id, task_id, shift_id, work_date], (err) => {
        if (err) {
            console.error("❌ Error deleting from planning:", err);
            return res.status(500).json({ error: "DB error removing planning entry" });
        }

    db.query(deleteWorktimeQuery, [emp_id, shift_id, work_date], (err2) => {
        if (err2) {
                console.error("❌ Error deleting from worktime:", err2);
                return res.status(500).json({ error: "DB error removing worktime entry" });
                console.log("There is a problem ")
        }

        return res.json({ success: true, message: "Entry deleted successfully" });
    });
    });
};

