require('dotenv').config();

module.exports = {
  // Claude API Configuration
  claudeApiKey: process.env.CLAUDE_API_KEY,
  claudeModel: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  claudeApiUrl: 'https://api.anthropic.com/v1/messages',

  // Server Configuration
  apiPort: parseInt(process.env.API_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Configuration
  requestTimeout: 30000, // 30 seconds
  maxCodeSize: 10000, // Maximum characters for code snippet

  // Supported Languages
  supportedLanguages: ['javascript', 'typescript'],

  // Score Ranges
  scoreMin: 0,
  scoreMax: 100,

  // Claude API Constants
  claudeMaxTokens: 2048,

  // Validation
  validateConfig: function() {
    if (!this.claudeApiKey) {
      throw new Error('CLAUDE_API_KEY environment variable is required');
    }
    if (!this.claudeModel) {
      throw new Error('CLAUDE_MODEL environment variable is required');
    }
  }
};
