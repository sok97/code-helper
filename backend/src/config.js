require('dotenv').config();

module.exports = {

  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiModel: process.env.GEMINI_API_MODEL,





  apiPort: parseInt(process.env.API_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',


  requestTimeout: 30000, // 30 seconds
  maxCodeSize: 10000,  // maximum code size in characters


  supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'json', 'yaml', 'markdown', 'chatagent', 'plaintext'],


  scoreMin: 0,
  scoreMax: 100,


  claudeMaxTokens: 2048,

  validateConfig: function () {
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    if (!this.geminiApiModel) {
      throw new Error('GEMINI_API_MODEL environment variable is required');
    }
  }
};
