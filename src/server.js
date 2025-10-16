require('dotenv').config();
const express = require('express');
const cors = require('cors');
const employeesRoutes = require('./routes/employees');
const worktimeRoutes = require('./routes/worktime');
const planningRoutes = require('./routes/planning.js'); 

const app = express();


app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('✅ Express is working!');
});

app.use('/employees', employeesRoutes);
app.use('/worktime', worktimeRoutes);

app.use('/api', planningRoutes); 



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});