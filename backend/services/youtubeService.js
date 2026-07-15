const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Extracts the video ID from various styles of YouTube URLs
 * @param {string} url - The full YouTube video link
 * @returns {string|null} The isolated video identifier
 */
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Fetches and aggregates full English transcripts from a YouTube video ID
 * @param {string} videoUrl - The full target video URL
 * @returns {Promise<string>} Clean aggregated transcript text string
 */
async function getYouTubeTranscript(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL provided.');
    }

    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Combine separated subtitle blocks into unified text paragraphs
    const fullText = transcriptItems
      .map(item => item.text)
      .join(' ');

    return fullText;
  } catch (error) {
    console.error('YouTube Transcript Extraction Error:', error.message);
    throw new Error('Failed to retrieve video transcript. Ensure captions are enabled.');
  }
}

module.exports = { getYouTubeTranscript };