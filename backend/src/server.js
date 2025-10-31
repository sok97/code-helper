const express = require('express');
const cors = require('cors');
const config = require('./config');
const CodeAnalyzer = require('./analyzer');

// Validate configuration
try {
  config.validateConfig();
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

const app = express();
const analyzer = new CodeAnalyzer();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.setHeader('X-Process-Time', duration);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language, fileName, fileSize } = req.body;
    const startTime = Date.now();

    // Validation: required fields
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code snippet cannot be empty'
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: language'
      });
    }

    // Validation: language support
    const normalizedLanguage = language.toLowerCase();
    if (!config.supportedLanguages.includes(normalizedLanguage)) {
      return res.status(400).json({
        success: false,
        error: `Language not yet supported. Currently supporting: ${config.supportedLanguages.join(', ')}`
      });
    }

    // Validation: code size
    if (code.length > config.maxCodeSize) {
      return res.status(400).json({
        success: false,
        error: `Code snippet too long. Maximum ${config.maxCodeSize} characters`
      });
    }

    // Log request (without actual code for privacy)
    console.log(`[${new Date().toISOString()}] Analysis request - Language: ${normalizedLanguage}, Size: ${code.length} chars`);

    // Call analyzer
    const analysisResult = await analyzer.analyze(code, normalizedLanguage);

    // Add metadata
    const processingTime = Date.now() - startTime;
    const response = {
      ...analysisResult,
      _meta: {
        processingTime,
        timestamp: new Date().toISOString(),
        fileName: fileName || 'unknown',
        codeSize: code.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Analysis error:', error);

    // Handle Claude API errors
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Analysis service not properly configured'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'API quota exceeded. Please try again in a few moments.'
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        error: 'Analysis service temporarily unavailable. Try again in a moment.'
      });
    }

    if (error.status >= 500) {
      return res.status(500).json({
        success: false,
        error: 'Analysis service encountered an error. Please try again.'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const port = config.apiPort;
app.listen(port, () => {
  console.log(`Code Helper backend running on http://localhost:${port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Claude Model: ${config.claudeModel}`);
});
