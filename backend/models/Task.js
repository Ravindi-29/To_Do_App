const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    assignedDayIndex: { type: Number, required: true }, // 0=Mon, ..., 6=Sun
    completed: { type: Boolean, default: false },
    type: { type: String, enum: ['Admin', 'User'], required: true },
    missed: { type: Boolean, default: false },
    weekStartDate: { type: Date, required: true } // Identification of which week this belongs to
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
