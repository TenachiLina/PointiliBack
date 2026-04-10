const express = require('express');
const cors = require('cors'); // import cors
const employeesRoutes = require('./routes/employees');
const worktimeRoutes = require('./routes/worktime');
const planningRoutes = require('./routes/planning');
const shiftsRoutes = require('./routes/shiftsRoutes');
const advancesRoutes = require('./routes/advances');
const path = require('path');

const app = express();


app.use((req, res, next) => {
  console.log("🌐 INCOMING:", req.method, req.originalUrl);
  next();
});


// --- Allow all origins ---
app.use(cors()); // ✅ this allows requests from any origin
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => res.send('✅ Express is working!'));
app.get('/test', (req, res) => res.json({ message: "Server is connected properly ✅" }));



app.use('/api/employees', employeesRoutes);
app.use('/api/worktime', worktimeRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/advances', advancesRoutes);



//refresh fix ✅ 
const frontendPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Start server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
console.log("🚀 SERVER.JS RUNNING");

