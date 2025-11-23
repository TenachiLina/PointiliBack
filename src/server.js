//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const employeesRoutes = require('./routes/employees');
const worktimeRoutes = require('./routes/worktime');
const planningRoutes = require('./routes/planning.js');

const app = express();


const allowedOrigins = [
  "https://pointilifront1.vercel.app" // old Vercel URL (optional)
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Express is working!');
});

app.get('/test', (req, res) => {
  res.json({ message: "Server is connected properly ✅" });
});

app.use('/api/employees', employeesRoutes);

app.use('/', worktimeRoutes);  // ← no prefix

app.use('/api/worktime', worktimeRoutes);
app.use('/api/planning', planningRoutes);


//NEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
app.use('/api/planning', planningRoutes);




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});