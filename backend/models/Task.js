const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    assignedDayIndex: { type: Number, required: true }, // 0=Mon, ..., 6=Sun
    completed: { type: Boolean, default: false },
    type: { type: String, enum: ['Admin', 'User'], required: true },
    missed: { type: Boolean, default: false },
    time: { type: String, default: "" }, // E.g., "09:00", "11:30"
    date: { type: String, default: "" }, // E.g., "2026-09-22"
    isRecurring: { type: Boolean, default: false }, // If true, repeats weekly on assignedDayIndex
    weekStartDate: { type: Date, required: true } // Identification of which week this belongs to
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
