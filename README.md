# Code Helper

A powerful Visual Studio Code extension that provides AI-powered code assistance, including code quality analysis and intelligent code generation for multiple programming languages.

## ✨ Features

### 📊 Code Quality Analysis
- **Detailed Metrics**: Get comprehensive maintainability scores and code metrics
- **Issue Detection**: Identify potential problems, code smells, and anti-patterns
- **Smart Suggestions**: Receive AI-powered recommendations for code improvement
- **Real-time Feedback**: Instant analysis results displayed in an intuitive sidebar

### 🚀 AI-Powered Code Generation
- **Multi-Language Support**: Generate code in 20+ programming languages including:
  - JavaScript, TypeScript, Python, Java, C, C++, C#
  - Go, Rust, PHP, Ruby, Swift, Kotlin
  - HTML, CSS, SQL, JSON, YAML, Markdown
- **Natural Language Input**: Describe what you need in plain English
- **Context-Aware**: Generates clean, efficient code following best practices
- **Quick Access**: Integrated sidebar UI for easy code generation

### ⚡ Quick Access
- Keyboard shortcuts for instant analysis (Ctrl+Alt+A)
- Command palette integration
- Context menu options
- Dedicated sidebar panel

## 📋 Requirements

- **Node.js**: v20 or higher
- **Visual Studio Code**: v1.80.0 or higher
- **Gemini API Key**: Required for backend AI services (free tier available from Google AI Studio)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sok97/code-helper.git
cd code-helper
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_MODEL=gemini-2.5-flash
API_PORT=3000
NODE_ENV=development
```

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

### 4. Extension Setup
```bash
cd ../extension
npm install
```

## 🚀 Running the Extension Locally

### Start the Backend Server
```bash
cd backend
npm start
# Server will start on http://localhost:3000
```

### Launch the Extension in Development Mode
```bash
cd extension
code .
```

In VS Code:
1. Press **F5** to start the Extension Development Host
2. A new VS Code window will open with the extension loaded
3. Click the **Code Helper** icon in the activity bar to open the sidebar
4. You're ready to use both code analysis and code generation features!

## 📖 Usage Guide

### Code Quality Analysis

1. **Open a file** with JavaScript or TypeScript code
2. **Select the code** you want to analyze
3. **Trigger analysis** using one of these methods:
   - Press `Ctrl+Alt+A` (Windows/Linux) or `Cmd+Alt+A` (Mac)
   - Right-click → "Code Helper: Analyze Selected Code"
   - Command Palette (Ctrl/Cmd+Shift+P) → "Code Helper: Analyze Selected Code"
4. **View results** in the Code Helper sidebar with:
   - Maintainability score (0-100)
   - Complexity, readability, testability, and modularity metrics
   - Identified issues with detailed explanations
   - Actionable improvement suggestions

### AI Code Generation

1. **Open the Code Helper sidebar** (click the icon in the activity bar)
2. **Enter your prompt** describing what code you need
   - Example: "Create a function to validate email addresses"
   - Example: "Build a REST API endpoint for user authentication"
3. **Select the target language** from the dropdown
4. **Click "Generate Code"**
5. **Review and use** the generated code

## 🏗️ Project Structure

```
code-helper/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── server.js       # Express server setup
│   │   ├── config.js       # Configuration management
│   │   ├── codeAnalyzer.js # Code analysis logic
│   │   └── codeGenerator.js # AI code generation
│   ├── package.json
│   └── .env                # Environment variables (create this)
│
└── extension/              # VS Code extension
    ├── src/
    │   ├── extension.js    # Extension entry point
    │   ├── webviewProvider.js # Sidebar UI provider
    │   └── apiClient.js    # Backend API client
    ├── resources/          # Extension resources
    │   └── code-helper.svg # Extension icon
    └── package.json
```

## 🎯 Features in Detail

### Code Analysis

**Maintainability Score**
- Comprehensive 0-100 score assessing overall code quality
- Based on industry-standard metrics and best practices

**Code Metrics**
- **Complexity**: Cyclomatic complexity and control flow analysis
- **Readability**: Variable naming, code structure, documentation
- **Testability**: Code modularity and dependency management
- **Modularity**: Separation of concerns and code organization

**Issue Detection**
- Identifies common code smells and anti-patterns
- Highlights potential bugs and security concerns
- Suggests refactoring opportunities

### Code Generation

**Supported Languages**
JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, HTML, CSS, SQL, JSON, YAML, Markdown, and more

**Smart Generation**
- Context-aware code that follows language-specific best practices
- Automatic import statements when needed
- Clean, readable, and efficient output
- Fallback handling for unclear requests

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes and test thoroughly
4. **Commit** your changes: `git commit -m 'Add amazing feature'`
5. **Push** to your branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes in both development and production modes
- Update documentation for new features

## 🐛 Troubleshooting

**Backend won't start:**
- Verify Node.js version is v20+
- Check that `.env` file exists with valid `GEMINI_API_KEY`
- Ensure port 3000 is not already in use

**Extension not working:**
- Confirm backend server is running on `http://localhost:3000`
- Check VS Code developer console for errors (Help → Toggle Developer Tools)
- Reload the Extension Development Host window

**API errors:**
- Verify your Gemini API key is valid and has quota remaining
- Check internet connection
- Review backend server logs for detailed error messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with ❤️ for the VS Code community

---

**Made with** ❤️ **by** [sok97](https://github.com/sok97)
