# Code Helper

A Visual Studio Code extension that provides AI-powered code quality analysis for JavaScript and TypeScript code, offering maintainability scores, metrics, and actionable suggestions for improvement.

## Features

- 📊 **Code Quality Analysis**: Get detailed maintainability scores and metrics for your code
- 🔍 **Issue Detection**: Identify potential problems and code smells
- 💡 **Smart Suggestions**: Receive AI-powered recommendations for improvement
- 🎯 **Language Support**: JavaScript and TypeScript
- ⚡ **Quick Access**: Analyze code with keyboard shortcut (Ctrl+Alt+A)

## Requirements

- Node.js v20 or higher
- Visual Studio Code v1.80.0 or higher
- Claude API Key for the backend service

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sok97/code-helper.git
cd code-helper
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Configure the backend:
   - Create a `.env` file in the `backend` directory
   - Add your Claude API key:
```
CLAUDE_API_KEY=your_api_key_here
```

4. Install extension dependencies:
```bash
cd ../extension
npm install
```

## Running Locally

1. Start the backend server:
```bash
cd backend
npm start
# Server will start on http://localhost:3000
```

2. Open the extension in VS Code:
```bash
cd ../extension
code .  # Opens VS Code in the extension folder
```

3. Launch the extension:
   - When VS Code opens, press F5 to start the Extension Development Host
   - A new VS Code window will pop up (this is the Extension Development Host)
   - In this new window, open any JavaScript or TypeScript file you want to analyze
   - Press Ctrl+Shift+P to open the Command Palette
   - Type "Code Helper" and select "Code Helper: Analyze Selected Code"
   - The analysis results will appear in the Code Helper sidebar


## Usage

1. Open any JavaScript or TypeScript file in VS Code
2. Select the code you want to analyze
3. Use one of these methods to run the analysis:
   - Press `Ctrl+Alt+A` (Windows/Linux) or `Cmd+Alt+A` (Mac)
   - Right-click and select "Code Helper: Analyze Selected Code"
   - Open Command Palette (Ctrl/Cmd+Shift+P) and search for "Code Helper: Analyze Selected Code"
4. View results in the Code Helper sidebar

## Features in Detail

### Maintainability Score
- Overall code quality score (0-100)
- Based on multiple factors including complexity, readability, and modularity

### Code Metrics
- Complexity: Measures code structure and flow complexity
- Readability: Evaluates how easy the code is to understand
- Testability: Assesses how well the code can be tested
- Modularity: Measures code organization and separation of concerns

### Analysis Features
- Real-time code analysis
- Detailed issue explanations
- Practical improvement suggestions
- Code examples in suggestions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
