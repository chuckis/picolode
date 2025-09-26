# picolode README

This is the README for your extension "picolode". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

### Evaluate PicoLisp inline

This extension adds a command `Evaluate PicoLisp Selection` (command id `picolode.evalSelection`) that runs the selected PicoLisp code (or the current line if there's no selection) using the `pil` command-line interpreter and shows the result inline as a decoration. A default keybinding is `Ctrl+Enter` when the editor language id is `picolisp`.

Requirements:
- `pil` PicoLisp interpreter must be installed and available in your PATH.

Settings:
- `picolode.pilPath` (string) — path to the `pil` executable. Default: `pil`.
- `picolode.timeout` (number) — evaluation timeout in milliseconds. Default: `5000`.

Usage:
- Select code or place the cursor on a line and press `Ctrl+Enter` (or run the command from the command palette).

Debugging language mode
- If `.l` files aren't recognized as `PicoLisp`, you can set a file association in Settings:

```json
{
	"files.associations": { "*.l": "picolisp" }
}
```

- Launching VS Code from a shell (so PATH is inherited) can fix cases where `pil` isn't available in the Dev Host. To do that, start VS Code from a terminal (`code .`) rather than the desktop shortcut.

Quick debug command
- A helper command `Show active languageId` (`picolode.showLanguageId`) is available in the command palette while developing — it will display the current editor's `languageId`.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

## Development

Two common development workflows are supported:

- Webpack (recommended for debugging the packaged extension):
	- Builds to `dist/extension.js` using the project's `webpack.config.js`.
	- Run `npm run compile` to produce a single bundled file. For incremental builds use `npm run dev:watch`.

- TypeScript emit (fast iteration of TS source):
	- Emits compiled JS to `out/` via `tsc` (used by the test setup).
	- Run `npm run compile-tests` or `tsc -p . --outDir out` and set `main` to `./out/extension.js` if you prefer this workflow.

When actively developing, either build method works — make sure `package.json` `main` points to the artifact you use (`./dist/extension.js` for webpack, `./out/extension.js` for tsc output).
