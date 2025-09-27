# picolode

PicoLode is a VS Code extension for evaluating PicoLisp code inline. It allows you to run selected code or the current line using the `pil` command-line interpreter and shows results directly in the editor.

## Features

- Evaluate PicoLisp selection using `Ctrl+Shift+Enter`.
- Display results inline as a decoration.
- Quick debug command to show the active editor's `languageId`.

![Example](images/feature.png)  

## Requirements

- `pil` PicoLisp interpreter must be installed and available in your PATH.

## Usage

1. Select PicoLisp code or place the cursor on a line.
2. Press `Ctrl+Shift+Enter` or run `Evaluate PicoLisp Selection` from the command palette.
3. Optionally configure:
   - `picolode.pilPath` — path to the `pil` executable (default: `pil`)
   - `picolode.timeout` — evaluation timeout in milliseconds (default: 5000)

### File Associations

If `.l` files aren't recognized as PicoLisp:

```json
{
  "files.associations": { "*.l": "picolisp" }
}
