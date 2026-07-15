const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sourceType: { type: String, enum: ['text', 'pdf', 'youtube'], required: true },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);