const multer = require('multer');
const pdfParse = require('pdf-parse');

const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { generateQuizFromText } = require('../services/aiService');
const { getYouTubeTranscript } = require('../services/youtubeService');

// Configure multer to hold files in memory buffers temporarily instead of saving to disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/quizzes/generate-text
// @desc    Generate a quiz from raw text input
// @access  Public
router.post('/generate-text', async (req, res) => {
  try {
    const { title, textContent, questionCount } = req.body;

    if (!textContent || textContent.trim() === '') {
      return res.status(400).json({ error: 'Text content is required for quiz generation.' });
    }

    // Call the Groq AI service layer passing the dynamic questionCount
    const aiGeneratedQuiz = await generateQuizFromText(textContent, questionCount);

    // Save the structured result into MongoDB
    const newQuiz = new Quiz({
      title: title || aiGeneratedQuiz.title || 'Untitled AI Quiz',
      sourceType: 'text',
      questions: aiGeneratedQuiz.questions
    });

    await newQuiz.save();

    return res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Quiz Generation Error:', error.message);
    return res.status(500).json({ error: 'Internal server error during quiz generation.' });
  }
});

// @route   GET /api/quizzes
// @desc    Retrieve all generated quizzes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    return res.status(200).json(quizzes);
  } catch (error) {
    console.error('Fetch Quizzes Error:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve quizzes.' });
  }
});

// @route   POST /api/quizzes/generate-pdf
// @desc    Generate a quiz from an uploaded PDF file
// @access  Public
router.post('/generate-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    // Extract text layout from the uploaded document buffer
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ error: 'Could not extract valid text from the uploaded PDF.' });
    }

    // Capture dynamic questionCount from the text multipart body fields
    const questionCount = req.body.questionCount;

    // Pipe text directly into the unified Groq model processing layer
    const aiGeneratedQuiz = await generateQuizFromText(extractedText, questionCount);

    const newQuiz = new Quiz({
      title: req.body.title || aiGeneratedQuiz.title || 'PDF AI Quiz',
      sourceType: 'pdf',
      questions: aiGeneratedQuiz.questions
    });

    await newQuiz.save();

    return res.status(201).json(newQuiz);
  } catch (error) {
    console.error('PDF Quiz Generation Controller Error:', error.message);
    return res.status(500).json({ error: 'Internal server error processing PDF file.' });
  }
});

// @route   POST /api/quizzes/generate-youtube
// @desc    Generate a quiz from a YouTube video URL transcript
// @access  Public
router.post('/generate-youtube', async (req, res) => {
  try {
    const { title, videoUrl, questionCount } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'YouTube video URL is required.' });
    }

    // Process transcript extraction asynchronously
    const transcriptText = await getYouTubeTranscript(videoUrl);

    // Pipe the derived text directly into the unified Groq model processing layer
    const aiGeneratedQuiz = await generateQuizFromText(transcriptText, questionCount);

    const newQuiz = new Quiz({
      title: title || aiGeneratedQuiz.title || 'YouTube AI Quiz',
      sourceType: 'youtube',
      questions: aiGeneratedQuiz.questions
    });

    await newQuiz.save();

    return res.status(201).json(newQuiz);
  } catch (error) {
    console.error('YouTube Quiz Generation Controller Error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error processing YouTube quiz.' });
  }
});

// @route   DELETE /api/quizzes/clear-all
// @desc    Clear all historical quizzes from the repository database
// @access  Public
router.delete('/clear-all', async (req, res) => {
  try {
    // Drop all collection records inside MongoDB matching the Quiz schema model execution parameters
    await Quiz.deleteMany({});
    return res.status(200).json({ message: 'Historical quiz repositories purged successfully.' });
  } catch (error) {
    console.error('Clear History Controller Error:', error.message);
    return res.status(500).json({ error: 'Internal server error while purging historical records.' });
  }
});

module.exports = router;