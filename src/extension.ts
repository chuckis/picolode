import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("PicoLisp");

  // Function to execute PicoLisp code via stdin
  function executePicoLisp(code: string): Promise<{ stdout: string; stderr: string; error?: Error }> {
    return new Promise((resolve) => {
      const config = vscode.workspace.getConfiguration("picolode");
      const pilPath = config.get<string>("picolode.pilPath") || "pil";
      const timeout = config.get<number>("picolode.timeout") || 5000;

      const child = spawn(pilPath, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;

      // Set timeout
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({ 
          stdout: '', 
          stderr: 'Timeout exceeded', 
          error: new Error('Process timeout') 
        });
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({ stdout, stderr, error: code !== 0 ? new Error(`Exit code: ${code}`) : undefined });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({ stdout, stderr, error });
      });

      // Send code via stdin
      child.stdin.write(code);
      child.stdin.write('\n(bye)\n'); // End PicoLisp session
      child.stdin.end();
    });
  }

  // Alternative function with temporary file in safe location
  function executePicoLispWithFile(code: string): Promise<{ stdout: string; stderr: string; error?: Error }> {
    return new Promise(async (resolve) => {
      try {
        // Use extension's globalStorageUri for temporary files
        const tempDir = context.globalStorageUri.fsPath;
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tmpFile = path.join(tempDir, `temp_${Date.now()}.l`);
        
        // Write code to file
        fs.writeFileSync(tmpFile, code, 'utf8');

        const config = vscode.workspace.getConfiguration("picolode");
        const pilPath = config.get<string>("picolode.pilPath") || "pil";
        const timeout = config.get<number>("picolode.timeout") || 5000;

        const child = spawn(pilPath, [tmpFile], {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });

        let stdout = '';
        let stderr = '';
        let timeoutId: NodeJS.Timeout;

        timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          // Clean up temporary file
          try { fs.unlinkSync(tmpFile); } catch {}
          resolve({ 
            stdout: '', 
            stderr: 'Timeout exceeded', 
            error: new Error('Process timeout') 
          });
        }, timeout);

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          clearTimeout(timeoutId);
          // Clean up temporary file
          try { fs.unlinkSync(tmpFile); } catch {}
          resolve({ stdout, stderr, error: code !== 0 ? new Error(`Exit code: ${code}`) : undefined });
        });

        child.on('error', (error) => {
          clearTimeout(timeoutId);
          // Clean up temporary file
          try { fs.unlinkSync(tmpFile); } catch {}
          resolve({ stdout, stderr, error });
        });

      } catch (fsError) {
        resolve({ stdout: '', stderr: `File error: ${fsError}`, error: fsError as Error });
      }
    });
  }

  // Command: output to OutputChannel
  const runSelection = vscode.commands.registerCommand('picolode.evalSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const codeToRun = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

    if (!codeToRun.trim()) {
      vscode.window.showWarningMessage('No code to evaluate');
      return;
    }

    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine('Executing PicoLisp code...');

    try {
      // Try stdin first, fallback to file if it doesn't work
      let result = await executePicoLisp(codeToRun);
      
      // If stdin doesn't work, try file method
      if (result.error && result.stderr.includes('stdin')) {
        result = await executePicoLispWithFile(codeToRun);
      }

      if (result.error) {
        outputChannel.appendLine(`❌ Error: ${result.error.message}`);
        if (result.stderr) {
          outputChannel.appendLine(result.stderr);
        }
      } else {
        const output = result.stdout.trim();
        outputChannel.appendLine(output || '<no output>');
      }
    } catch (error) {
      outputChannel.appendLine(`❌ Execution failed: ${error}`);
    }
  });

  // Command: inline output after cursor
  const runSelectionInline = vscode.commands.registerCommand('picolode.evalSelectionInline', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const codeToRun = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

    if (!codeToRun.trim()) {
      vscode.window.showWarningMessage('No code to evaluate');
      return;
    }

    try {
      
      let result = await executePicoLisp(codeToRun);
      
      
      if (result.error && result.stderr.includes('stdin')) {
        result = await executePicoLispWithFile(codeToRun);
      }

      let displayResult = "";
      let isError = false;

      if (result.error) {
        displayResult = `ERROR: ${result.stderr || result.error.message}`;
        isError = true;
      } else {
        displayResult = result.stdout.trim() || '<no output>';
      }

      // Limit result length for inline display
      if (displayResult.length > 100) {
        displayResult = displayResult.substring(0, 97) + '...';
      }

      // Create inline decoration
      const decorationType = vscode.window.createTextEditorDecorationType({
        after: {
          margin: '0 0 0 1rem',
          color: isError ? '#ff6b6b' : '#888',
          fontStyle: 'italic'
        }
      });

      const line = selection.isEmpty ? editor.selection.active.line : selection.end.line;
      const range = new vscode.Range(line, Number.MAX_SAFE_INTEGER, line, Number.MAX_SAFE_INTEGER);
      
      editor.setDecorations(decorationType, [{
        range,
        renderOptions: {
          after: { contentText: ` ${displayResult}` }
        }
      }]);

      // Remove decoration after 8 seconds
      setTimeout(() => {
        editor.setDecorations(decorationType, []);
      }, 8000);

    } catch (error) {
      vscode.window.showErrorMessage(`Execution failed: ${error}`);
    }
  });

  context.subscriptions.push(runSelection, runSelectionInline);
}

export function deactivate() {}