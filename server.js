const express = require('express');
const connectDB = require('./config/db');


const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('TradingPanel API is running'));

// Define Routes
app.use('/api/stock', require('./routes/api/stock'));
app.use('/api/user', require('./routes/api/user'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
