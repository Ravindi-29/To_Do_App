require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health / Status Check
app.get('/', (req, res) => {
    res.json({
        status: 'Online',
        message: 'To-Do Backend API is running successfully'
    });
});

app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    res.json({
        status: 'OK',
        database: dbStatusMap[dbState] || 'Unknown',
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET
    });
});

// Routes (supported with and without /api prefix for compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

// Database Connection
if (!process.env.MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI environment variable is missing! Please configure it in Azure App Service Application Settings.');
} else {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB successfully');
        })
        .catch(err => {
            console.error('MongoDB connection error:', err.message);
        });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

