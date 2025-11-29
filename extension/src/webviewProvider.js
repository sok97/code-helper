const vscode = require('vscode');

class WebviewProvider {
  constructor(context, apiClient) {
    this.context = context;
    this.apiClient = apiClient;
    this.webview = null;
    this.currentState = 'idle'; // idle, loading, success, error
    this.currentAnalysis = null;
    this.currentError = null;
  }

  async resolveWebviewView(webviewView, context, token) {
    this.webview = webviewView.webview;
    this.webview.options = {
      enableScripts: true
    };

    this.webview.html = this.getIdleHtml();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'generateCode':
          await this.handleGenerateCode(message.prompt);
          break;
      }
    });
  }

  async handleGenerateCode(prompt) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('Please open a file to generate code into.');
      return;
    }

    const language = editor.document.languageId;

    try {
      // Update UI to loading state (optional, or just show progress notification)
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating code...",
        cancellable: false
      }, async (progress) => {
        const result = await this.apiClient.generateCode(prompt, language);

        if (result.success && result.code) {
          // Insert code at cursor
          await editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, result.code);
          });
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Generation failed: ${error.userMessage || error.message}`);
    }
  }

  async analyzeCode(code, language, fileName, fileSize) {
    try {
      // Update UI to loading state
      this.currentState = 'loading';
      this.webview.html = this.getLoadingHtml();

      // Call API
      const result = await this.apiClient.analyzeCode(code, language, fileName, fileSize);

      // Update state with results
      this.currentState = 'success';
      this.currentAnalysis = result;
      this.currentError = null;

      // Render success UI
      this.webview.html = this.getSuccessHtml(result);

    } catch (error) {
      // Update state with error
      this.currentState = 'error';
      this.currentError = error;
      this.currentAnalysis = null;

      // Render error UI
      this.webview.html = this.getErrorHtml(error);
    }
  }

  getIdleHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Helper</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }

    .container {
      max-width: 100%;
    }

    .header {
      margin-bottom: 20px;
    }

    h1 {
      font-size: 20px;
      margin-bottom: 10px;
    }

    .intro-text {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .card {
      border: 1px solid var(--vscode-inputBorder);
      border-radius: 6px;
      padding: 15px;
      background: var(--vscode-input-background);
      margin-bottom: 20px;
    }

    .section-title {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 14px;
    }

    textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-inputBorder);
      border-radius: 4px;
      resize: vertical;
      font-family: inherit;
      margin-bottom: 10px;
    }

    textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }

    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 2px;
      cursor: pointer;
      width: 100%;
      font-size: 13px;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Code Helper</h1>
    </div>

    <div class="card">
      <div class="section-title">✨ Generate Code</div>
      <p class="intro-text" style="margin-bottom: 10px; font-size: 12px;">
        Describe what you want to create, and AI will generate the code for you.
      </p>
      <textarea id="promptInput" placeholder="E.g., Create a function to validate email addresses..."></textarea>
      <button id="generateBtn">Generate Code</button>
    </div>

    <div class="card">
      <div class="section-title">🔍 Analyze Code</div>
      <p class="intro-text">
        Select code in your editor and use the <strong>Code Helper: Analyze Selected Code</strong>
        command (Ctrl+Alt+A) to get an AI-powered analysis.
      </p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('promptInput');

    generateBtn.addEventListener('click', () => {
      const prompt = promptInput.value.trim();
      if (prompt) {
        vscode.postMessage({
          command: 'generateCode',
          prompt: prompt
        });
        // Optional: Clear input or show loading state in button
        promptInput.value = '';
      }
    });
  </script>
</body>
</html>`;
  }

  getLoadingHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Helper - Analyzing</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .spinner {
      border: 3px solid var(--vscode-inputBorder);
      border-top: 3px solid var(--vscode-button-background);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 16px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <div class="spinner"></div>
    <p class="loading-text">Analyzing your code...</p>
  </div>
</body>
</html>`;
  }

  getSuccessHtml(analysis) {
    const maintainabilityScore = analysis.maintainabilityScore || 0;
    const scoreColor = this.getScoreColor(maintainabilityScore);
    const scoreLabel = this.getScoreLabel(maintainabilityScore);
    const metrics = analysis.metrics || {};
    const issues = analysis.issues || [];
    const suggestions = analysis.suggestions || [];
    const meta = analysis._meta || {};

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Helper - Analysis Results</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }

    .container {
      max-width: 100%;
    }

    h1 {
      font-size: 18px;
      margin-bottom: 20px;
    }

    .card {
      border: 1px solid var(--vscode-inputBorder);
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      background: var(--vscode-input-background);
    }

    .score-card {
      text-align: center;
      padding: 25px 15px;
    }

    .score-number {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
      color: ${scoreColor};
    }

    .score-label {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .metric {
      border: 1px solid var(--vscode-inputBorder);
      border-radius: 6px;
      padding: 15px;
      text-align: center;
      background: var(--vscode-input-background);
    }

    .metric-score {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .metric-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    .section-title {
      font-size: 14px;
      font-weight: bold;
      margin: 15px 0 10px 0;
      color: var(--vscode-descriptionForeground);
    }

    .issue-item {
      border-left: 3px solid;
      padding: 10px 12px;
      margin-bottom: 10px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.1);
    }

    .issue-high {
      border-left-color: #f48771;
    }

    .issue-medium {
      border-left-color: #ddb100;
    }

    .issue-low {
      border-left-color: #007acc;
    }

    .issue-title {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 13px;
    }

    .issue-description {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 5px;
    }

    .issue-line {
      font-size: 11px;
      color: #888;
    }

    .suggestion-item {
      border: 1px solid var(--vscode-inputBorder);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
      background: var(--vscode-input-background);
    }

    .suggestion-title {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 13px;
    }

    .suggestion-description {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
    }

    .code-example {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-inputBorder);
      border-radius: 3px;
      padding: 10px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 11px;
      overflow-x: auto;
      color: var(--vscode-editor-foreground);
      margin-top: 8px;
    }

    .footer {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid var(--vscode-inputBorder);
    }

    .empty-state {
      text-align: center;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      padding: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Code Analysis Report</h1>

    <div class="card score-card">
      <div class="score-number">${maintainabilityScore}</div>
      <div class="score-label">Maintainability Score - ${scoreLabel}</div>
    </div>

    <div class="metrics-grid">
      ${this.renderMetric('Complexity', metrics.complexity)}
      ${this.renderMetric('Readability', metrics.readability)}
      ${this.renderMetric('Testability', metrics.testability)}
      ${this.renderMetric('Modularity', metrics.modularity)}
    </div>

    ${issues.length > 0 ? `
      <div class="card">
        <div class="section-title">⚠️ Issues Found (${issues.length})</div>
        ${issues.map(issue => `
          <div class="issue-item issue-${issue.severity}">
            <div class="issue-title">${this.escapeHtml(issue.title)}</div>
            <div class="issue-description">${this.escapeHtml(issue.description)}</div>
            ${issue.lineNumber ? `<div class="issue-line">Line ${issue.lineNumber}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : `<div class="card"><div class="empty-state">✅ No issues found</div></div>`}

    ${suggestions.length > 0 ? `
      <div class="card">
        <div class="section-title">💡 Suggestions (${suggestions.length})</div>
        ${suggestions.map(suggestion => `
          <div class="suggestion-item">
            <div class="suggestion-title">${this.escapeHtml(suggestion.title)}</div>
            <div class="suggestion-description">${this.escapeHtml(suggestion.description)}</div>
            ${suggestion.codeExample ? `<div class="code-example">${this.escapeHtml(suggestion.codeExample)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="footer">
      <div>⏱️ Processing time: ${meta.processingTime || 'N/A'}ms</div>
      <div>📄 Code size: ${meta.codeSize || 'N/A'} chars</div>
      <div>🕐 ${new Date().toLocaleTimeString()}</div>
    </div>
  </div>
</body>
</html>`;
  }

  getErrorHtml(error) {
    const userMessage = error.userMessage || error.message || 'An unknown error occurred';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Helper - Error</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }

    .error-container {
      border: 1px solid #f48771;
      border-radius: 6px;
      padding: 20px;
      background: rgba(244, 135, 113, 0.1);
    }

    .error-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #f48771;
    }

    .error-message {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 15px;
      color: var(--vscode-foreground);
    }

    .retry-hint {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-title">❌ Analysis Failed</div>
    <div class="error-message">${this.escapeHtml(userMessage)}</div>
    <div class="retry-hint">Select code again and run the analysis command to retry.</div>
  </div>
</body>
</html>`;
  }

  renderMetric(name, metric) {
    const score = metric?.score || 0;
    const level = metric?.level || 'fair';
    return `
      <div class="metric">
        <div class="metric-score">${score}</div>
        <div class="metric-label">${name}</div>
      </div>
    `;
  }

  getScoreColor(score) {
    if (score >= 70) return '#6a9955'; // green
    if (score >= 40) return '#d4af37'; // yellow
    return '#f48771'; // red
  }

  getScoreLabel(score) {
    if (score >= 90) return 'Excellent - excellent code structure';
    if (score >= 75) return 'Good - well structured';
    if (score >= 50) return 'Fair - some improvements needed';
    return 'Poor - significant issues to address';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Monkey-patch for running in Node context
if (typeof document === 'undefined') {
  WebviewProvider.prototype.escapeHtml = function (text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
}

module.exports = WebviewProvider;
