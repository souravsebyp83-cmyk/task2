const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['To-Do', 'In-Progress', 'Completed'], default: 'To-Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);