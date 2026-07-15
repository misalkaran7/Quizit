const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Sends text to Groq API and forces a structured JSON Quiz response strictly in English
 * @param {string} contentText - The text extracted from PDF, Text, or YouTube
 * @param {number} questionCount - Dynamic number of questions requested by the user
 * @returns {Promise<Object>} The formatted quiz object
 */
async function generateQuizFromText(contentText, questionCount = 5) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert educational assessment generator. Your task is to generate a structured multiple-choice quiz based on the provided text.
          
          CRITICAL LANGUAGE REQUIREMENT: The source content provided to you may be in Hindi, Marathi, or any other language. You MUST translate the core concepts internally and generate the entire final JSON output—including the "title", "questionText", "options", and "explanation"—strictly and completely in ENGLISH. Do not use any other language or script in the output.
          
          You MUST respond with a valid JSON object matching this exact schema layout:
          {
            "title": "A concise, relevant title for the quiz written in English",
            "questions": [
              {
                "questionText": "The actual question being asked, written in English",
                "options": ["Option A in English", "Option B in English", "Option C in English", "Option D in English"],
                "correctAnswer": "The exact string from the options array that is correct",
                "explanation": "A one-sentence explanation clarifying why this answer is correct, written in English."
              }
            ]
          }
          Do not include markdown wrappers like \`\`\`json. Return pure raw JSON string only.`
        },
        {
          role: "user",
          content: `Generate a ${questionCount}-question multiple choice quiz based strictly on the following source material:\n\n${contentText.substring(0, 6000)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    return JSON.parse(rawResponse);
  } catch (error) {
    console.error("Groq AI Service Error:", error);
    throw new Error("Failed to process quiz via Groq API.");
  }
}

module.exports = { generateQuizFromText };