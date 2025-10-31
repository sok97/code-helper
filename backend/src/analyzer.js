const axios = require('axios');
const config = require('./config');

class CodeAnalyzer {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.claudeApiUrl,
      timeout: config.requestTimeout,
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': config.claudeApiKey
      }
    });
  }

  buildPrompt(code, language) {
    const systemPrompt = `You are a code quality analyzer. Analyze the provided code and return a JSON object with the following structure:
{
  "issues": [
    {
      "severity": "high|medium|low",
      "title": "Issue title",
      "description": "Detailed description",
      "lineNumber": <number>,
      "suggestion": "How to fix it"
    }
  ],
  "suggestions": [
    {
      "title": "Suggestion title",
      "description": "Description",
      "codeExample": "Suggested code",
      "priority": "high|medium|low"
    }
  ],
  "metrics": {
    "complexity": <0-100>,
    "readability": <0-100>,
    "testability": <0-100>,
    "modularity": <0-100>
  }
}
Be specific and actionable. Provide 2-5 issues and 1-3 suggestions.`;

    const userPrompt = `Analyze this ${language} code and provide a comprehensive analysis in JSON format:

\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON with the structure specified. Use ${language}-specific best practices for your analysis.`;

    return { systemPrompt, userPrompt };
  }

  async analyzeCode(code, language) {
    try {
      const { systemPrompt, userPrompt } = this.buildPrompt(code, language);

      const response = await this.axiosInstance.post('', {
        model: config.claudeModel,
        max_tokens: config.claudeMaxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      // Extract the text response from Claude
      const claudeResponse = response.data.content[0].text;

      // Parse JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(claudeResponse);
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', claudeResponse);
        throw new Error('Claude API returned invalid JSON format');
      }

      return analysisResult;
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.error?.message || 'Claude API error',
          code: error.response.data?.error?.type
        };
      }
      throw error;
    }
  }

  validateSeverity(issue, codeContext) {
    // Backend validation layer to ensure severity is appropriate
    const securityKeywords = ['sql', 'injection', 'xss', 'csrf', 'auth', 'password', 'secret', 'token', 'vulnerability'];
    const description = (issue.description || '').toLowerCase();
    const title = (issue.title || '').toLowerCase();

    // If security-related, always mark as high
    if (securityKeywords.some(keyword => description.includes(keyword) || title.includes(keyword))) {
      return 'high';
    }

    // Validate severity is one of allowed values
    const validSeverities = ['high', 'medium', 'low'];
    if (!validSeverities.includes(issue.severity)) {
      return 'medium'; // default to medium if invalid
    }

    return issue.severity;
  }

  calculateMaintainabilityScore(issues) {
    let baseScore = 100;

    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    baseScore -= (highIssues * 10);
    baseScore -= (mediumIssues * 5);
    baseScore -= (lowIssues * 2);

    // Clamp score between 0 and 100
    return Math.max(config.scoreMin, Math.min(config.scoreMax, baseScore));
  }

  getMetricLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  formatResponse(claudeAnalysis, code, language) {
    // Ensure issues array exists and validate each issue
    const issues = (claudeAnalysis.issues || []).map(issue => ({
      ...issue,
      severity: this.validateSeverity(issue, code),
      lineNumber: Math.max(1, issue.lineNumber || 1) // 1-based indexing
    }));

    // Ensure suggestions array exists
    const suggestions = (claudeAnalysis.suggestions || []);

    // Ensure metrics exist
    const metrics = claudeAnalysis.metrics || {
      complexity: 50,
      readability: 50,
      testability: 50,
      modularity: 50
    };

    // Validate and clamp metric scores
    Object.keys(metrics).forEach(key => {
      metrics[key] = Math.max(0, Math.min(100, metrics[key]));
    });

    // Calculate maintainability score
    const maintainabilityScore = this.calculateMaintainabilityScore(issues);

    // Build response with nested structure
    return {
      success: true,
      maintainabilityScore,
      metrics: {
        complexity: {
          score: metrics.complexity,
          level: this.getMetricLevel(metrics.complexity)
        },
        readability: {
          score: metrics.readability,
          level: this.getMetricLevel(metrics.readability)
        },
        testability: {
          score: metrics.testability,
          level: this.getMetricLevel(metrics.testability)
        },
        modularity: {
          score: metrics.modularity,
          level: this.getMetricLevel(metrics.modularity)
        }
      },
      issues,
      suggestions
    };
  }

  async analyze(code, language) {
    const claudeAnalysis = await this.analyzeCode(code, language);
    return this.formatResponse(claudeAnalysis, code, language);
  }
}

module.exports = CodeAnalyzer;
