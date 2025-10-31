const vscode = require('vscode');
const ApiClient = require('./apiClient');
const WebviewProvider = require('./webviewProvider');

let webviewProvider;

function activate(context) {
  console.log('Code Helper extension activated');

  // Initialize API client
  const apiClient = new ApiClient();

  // Create webview provider
  webviewProvider = new WebviewProvider(context, apiClient);

  // Register webview view provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'codeHelperView',
      webviewProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // Register analyze command
  const analyzeCommand = vscode.commands.registerCommand(
    'codeHelper.analyzeCode',
    () => handleAnalyzeCode(context, webviewProvider, apiClient)
  );

  context.subscriptions.push(analyzeCommand);
}

function deactivate() {
  console.log('Code Helper extension deactivated');
}

async function handleAnalyzeCode(context, webviewProvider, apiClient) {
  try {
    // Get active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    // Get selected text
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText || selectedText.trim().length === 0) {
      vscode.window.showErrorMessage('Please select code to analyze');
      return;
    }

    // Get language and filename
    const language = editor.document.languageId;
    const fileName = editor.document.fileName;
    const fileSize = selectedText.length;

    // Validate language
    if (!['javascript', 'typescript'].includes(language)) {
      vscode.window.showErrorMessage(
        `Language "${language}" is not supported. Currently supporting: JavaScript, TypeScript`
      );
      return;
    }

    // Show sidebar
    vscode.commands.executeCommand('codeHelperView.focus');

    // Trigger analysis
    await webviewProvider.analyzeCode(selectedText, language, fileName, fileSize);

  } catch (error) {
    console.error('Error in handleAnalyzeCode:', error);
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

module.exports = {
  activate,
  deactivate
};
