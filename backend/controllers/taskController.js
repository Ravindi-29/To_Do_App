const Task = require('../models/Task');
const User = require('../models/User');

// Get tasks for a logged-in user (includes admin tasks visible to all)
exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDayIndex = new Date().getDay();
        const normalizedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

        // Users see their own tasks + all Admin-created (shared) tasks
        const tasks = await Task.find({
            $or: [{ userId: userId }, { type: 'Admin' }]
        }).populate('userId', 'username email');

        // Smart Rearrangement
        let updated = false;
        tasks.forEach(task => {
            if (!task.completed && !task.missed && task.assignedDayIndex < normalizedDayIndex) {
                task.assignedDayIndex = normalizedDayIndex;
                updated = true;
            }
        });
        if (updated) await Promise.all(tasks.map(t => t.save()));

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ADMIN ONLY: Get ALL tasks from ALL users with user info
exports.getAllTasks = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }
        const tasks = await Task.find({}).populate('userId', 'username email role');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ADMIN ONLY: Get all users summary
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }
        const users = await User.find({}, 'username email role createdAt');
        // For each user, count their tasks
        const summary = await Promise.all(users.map(async (u) => {
            const total = await Task.countDocuments({ userId: u._id });
            const completed = await Task.countDocuments({ userId: u._id, completed: true });
            return {
                _id: u._id,
                username: u.username,
                email: u.email,
                role: u.role,
                totalTasks: total,
                completedTasks: completed,
                pendingTasks: total - completed
            };
        }));
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Task
exports.addTask = async (req, res) => {
    try {
        const { text, assignedDayIndex, type } = req.body;
        const task = new Task({
            userId: req.user.id,
            text,
            assignedDayIndex,
            type,
            weekStartDate: new Date()
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Task (Admin can update any task, User only their own)
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Only admin or task owner can update
        if (req.user.role !== 'Admin' && task.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.body.completed !== undefined) task.completed = req.body.completed;
        if (req.body.assignedDayIndex !== undefined) task.assignedDayIndex = req.body.assignedDayIndex;
        if (req.body.text !== undefined) task.text = req.body.text;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Task (Admin can delete any, User only their own)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.user.role !== 'Admin' && task.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
