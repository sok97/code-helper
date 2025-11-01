const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('./config');

class CodeAnalyzer {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.claudeApiKey);
  }

  buildPrompt(code, language) {
    const userPrompt = `Analyze this ${language} code and provide analysis in JSON format with this structure:
{
  "issues": [
    {
      "severity": "high|medium|low",
      "title": "Issue title",
      "description": "Detailed description",
      "lineNumber": 1,
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
    "complexity": 50,
    "readability": 75,
    "testability": 65,
    "modularity": 78
  }
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON, nothing else.`;

    return userPrompt;
  }

  async analyzeCode(code, language) {
    try {
      const userPrompt = this.buildPrompt(code, language);

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(userPrompt);
      const text = await result.response.text();

    
      let analysisResult;
      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', text);
        throw new Error('Gemini API returned invalid JSON format');
      }

      return analysisResult;
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw {
        status: error.status || 500,
        message: error.message || 'Gemini API error',
        code: error.code
      };
    }
  }

  validateSeverity(issue, codeContext) {
    const securityKeywords = ['sql', 'injection', 'xss', 'csrf', 'auth', 'password', 'secret', 'token', 'vulnerability'];
    const description = (issue.description || '').toLowerCase();
    const title = (issue.title || '').toLowerCase();

    if (securityKeywords.some(keyword => description.includes(keyword) || title.includes(keyword))) {
      return 'high';
    }

    const validSeverities = ['high', 'medium', 'low'];
    if (!validSeverities.includes(issue.severity)) {
      return 'medium';
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

    return Math.max(0, Math.min(100, baseScore));
  }

  getMetricLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  formatResponse(claudeAnalysis, code, language) {
    const issues = (claudeAnalysis.issues || []).map(issue => ({
      ...issue,
      severity: this.validateSeverity(issue, code),
      lineNumber: Math.max(1, issue.lineNumber || 1)
    }));

    const suggestions = (claudeAnalysis.suggestions || []);

    const metrics = claudeAnalysis.metrics || {
      complexity: 50,
      readability: 50,
      testability: 50,
      modularity: 50
    };

    Object.keys(metrics).forEach(key => {
      metrics[key] = Math.max(0, Math.min(100, metrics[key]));
    });

    const maintainabilityScore = this.calculateMaintainabilityScore(issues);

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
    const analysisResult = await this.analyzeCode(code, language);
    return this.formatResponse(analysisResult, code, language);
  }
}

module.exports = CodeAnalyzer;