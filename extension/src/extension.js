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

  // Register generate command
  const generateCommand = vscode.commands.registerCommand(
    'codeHelper.generateCode',
    () => handleGenerateCode(context, apiClient)
  );

  context.subscriptions.push(analyzeCommand);
  context.subscriptions.push(generateCommand);
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

  } catch (error) {
    console.error('Error in handleAnalyzeCode:', error);
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

async function handleGenerateCode(context, apiClient) {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const language = editor.document.languageId;

    const prompt = await vscode.window.showInputBox({
      placeHolder: 'Describe the code you want to generate...',
      prompt: `Generate ${language} code`
    });

    if (!prompt) return;

    // Show progress
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Generating code...",
      cancellable: false
    }, async (progress) => {
      try {
        const result = await apiClient.generateCode(prompt, language);

        if (result.success && result.code) {
          // Insert code at cursor
          editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, result.code);
          });
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Generation failed: ${error.userMessage || error.message}`);
      }
    });

  } catch (error) {
    console.error('Error in handleGenerateCode:', error);
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

module.exports = {
  activate,
  deactivate
};
