# JupyterLab Extension Development

This guide provides coding standards and best practices for developing JupyterLab extensions. Follow these rules to align with community standards and keep your extension maintainable.

**Extension type**: frontend-and-server

## External Documentation and Resources

### PRIORITY RESOURCE USAGE

**When you encounter uncertainty, incomplete information, or need implementation examples, you MUST consult these external resources FIRST before attempting to implement features.**

Use your available tools (web search, documentation search) to access and retrieve content from these resources when:

- You're unsure about API usage, method signatures, or interface requirements
- You need to verify the correct approach for a feature or pattern
- You're looking for existing implementation examples or best practices
- You're debugging unexpected behavior and need official documentation
- You're implementing a feature that likely exists in core JupyterLab or other extensions

### Required External Resources

**These resources are PRIORITY references. Always check them when you need external information:**

1. **JupyterLab Extension Developer Guide**
   - URL: https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html
   - Use for: Extension patterns, architecture overview, development workflow, and best practices
   - **Action**: Use web search or documentation tools to retrieve specific sections when needed

2. **JupyterLab API Reference (Frontend)**
   - URL: https://jupyterlab.readthedocs.io/en/latest/api/index.html
   - Use for: Complete API reference for all JupyterLab frontend packages, interfaces, classes, and methods
   - **Action**: Search for specific APIs when you need method signatures, interface definitions, or class documentation. For example, search "JupyterLab IRenderMime.IRenderer" or "JupyterLab ICommandPalette"

3. **JupyterLab Extension Examples Repository**
   - URL: https://github.com/jupyterlab/extension-examples
   - Use for: Working code examples, implementation patterns, complete working extensions
   - **Action**: Search this repository for similar features before implementing from scratch

4. **JupyterLab Core Repository**
   - URL: https://github.com/jupyterlab/jupyterlab
   - Use for: Reference implementations in `packages/` directory - all core packages are extensions themselves
   - **Action**: When implementing complex features, search this repo for how core extensions solve similar problems

5. **Jupyter Server API Documentation**
   - URL: https://jupyter-server.readthedocs.io/
   - Use for: Server-side API handlers, route setup, backend integration patterns
   - **Action**: Consult when working on backend routes or server extension configuration

6. **Project-Specific Documentation**
   - Locations: `README.md`, `RELEASE.md` in project root; check for `docs/` directory
   - Use for: Project requirements, specific configuration, custom conventions
   - **Action**: Read these files at the start of work and reference when making architectural decisions

### When to Use These Resources

**ALWAYS consult external documentation when:**

- ❗ You're about to implement a feature without knowing if there's an established pattern
- ❗ An API call or method isn't working as expected
- ❗ You need to understand the correct lifecycle methods or hooks
- ❗ You're uncertain about type definitions or interfaces
- ❗ You're implementing something that seems like it should be a common pattern

**HOW to access these resources:**

- 🔍 Use web search tools with specific queries like: "JupyterLab IRenderMime.IRenderer interface documentation"
- 🔍 Search GitHub repositories for code examples: "JupyterLab extension examples widget"
- 🔍 Retrieve documentation pages to read API specifications and usage guidelines
- 🔍 Look for working code in the extension-examples repository before writing custom implementations

**Remember:** These resources contain the authoritative information. Don't guess at API usage - look it up!

## Code Quality Rules

### Logging and Debugging

**❌ Don't**: Use `console.log()`
**✅ Do**: Use structured logging or user-facing notifications

```typescript
// In TypeScript files like src/index.ts
import { INotification } from '@jupyterlab/apputils';
app.commands.notifyCommandChanged();
```

**✅ Do**: Use `console.error()` to log low-level error details that should not be presented to users in the UI
**✅ Do**: Use `console.warn()` to log non-optimal conditions, e.g. an unexpected response from an external API that's been successfully handled.

### Type Safety

**✅ Do**: Define explicit interfaces (see example patterns in `src/index.ts`)

```typescript
interface PluginConfig {
  enabled: boolean;
  apiEndpoint: string;
}
```

**❌ Don't**: Use the `any` type in TypeScript files
**✅ Do**: Prefer typeguards over type casts

### File-Scoped Validation

After editing TypeScript files, run:

```bash
npx tsc --noEmit src/index.ts  # Check single file
npx tsc --noEmit               # Check all files
```

After editing Python files (like `jupyterlab_braket_devices/routes.py`):

```bash
python -m py_compile jupyterlab_braket_devices/__init__.py  # Check single file for syntax errors
```

## Coding Standards

### Naming Conventions

**Python** (in `jupyterlab_braket_devices/*.py` files):

- **✅ Do**: Use PEP 8 style with 4-space indentation
  - Classes: `DataProcessor`, `UserDataRouteHandler`
  - Functions/methods: `setup_route_handlers()`, `process_request()`
  - Private: `_internal_method()`
- **❌ Don't**: Use camelCase for Python or mix styles

**TypeScript/JavaScript** (in `src/*.ts` files):

- **✅ Do**: Use consistent casing
  - Classes/interfaces: `MyPanelWidget`, `PluginConfig`
  - Functions/variables: `activatePlugin()`, `buttonCount`
  - Constants: `PLUGIN_ID`, `COMMAND_ID`
- **✅ Do**: Use 2-space indentation (Prettier default)
- **❌ Don't**: Use lowercase_snake_case or inconsistent formatting

### Documentation

**✅ Do**: Add JSDoc for TypeScript and docstrings for Python

```typescript
/**
 * Activates the extension plugin.
 * @param app - JupyterLab application instance
 */
function activate(app: JupyterFrontEnd): void {}
```

**❌ Don't**: Leave complex logic undocumented or use vague names like `MyRouteHandler` — prefer `DataUploadRouteHandler`

### Code Organization

**✅ Do**: Keep backend and frontend logic separate

- Backend processing in `jupyterlab_braket_devices/routes.py`
- Frontend calls in `src/request.ts` using `requestAPI()`

**❌ Don't**: Duplicate business logic across TypeScript and Python

**✅ Do**: Implement features completely or not at all. Notify the prompter if you're unable to completely implement a feature.

**❌ Don't**: Leave TODO comments or dead code in committed files

## Project Structure and Naming

### Package Naming

**Python package** (directory name and imports):

- **✅ Do**: `jupyterlab_braket_devices/` with underscores, all lowercase
- **❌ Don't**: Use dashes in any Python file or directory names

**PyPI distribution name** (in `pyproject.toml`):

- **✅ Do**: Use dashes instead of underscores, like `jupyterlab-myext`
- **✅ Do**: Match it to the npm package name for consistency

**NPM package** (in `package.json`):

- **✅ Do**: Use lowercase with dashes: `"jupyterlab-myext"` or scoped `"@org/myext"`
- **❌ Don't**: Mix naming styles between package.json and pyproject.toml

### Plugin and Command IDs

**✅ Do**: Define plugin ID in `src/index.ts`:

```typescript
const PLUGIN_ID = 'jupyterlab_braket_devices:plugin';
```

**✅ Do**: For extensions with multiple commands, create a `src/commands.ts` module to centralize command definitions:

```typescript
// src/commands.ts
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

// Command IDs
export namespace CommandIDs {
  export const openPanel = 'jupyterlab_braket_devices:open-panel';
  export const refreshData = 'jupyterlab_braket_devices:refresh-data';
}

// Command argument types
export namespace CommandArguments {
  export interface IOpenPanel {
    filePath?: string;
  }

  export interface IRefreshData {
    force?: boolean;
  }
}

/**
 * Register all commands with the application command registry.
 * Call this function in your plugin's activate function.
 */
export function registerCommands(app: JupyterFrontEnd): void {
  // Register the openPanel command
  app.commands.addCommand(CommandIDs.openPanel, {
    label: 'Open Panel',
    caption: 'Open the extension panel',
    execute: (args: ReadonlyPartialJSONObject) => {
      const typedArgs = args as CommandArguments.IOpenPanel;
      // Implementation using typedArgs.filePath
    }
  });

  // Register the refreshData command
  app.commands.addCommand(CommandIDs.refreshData, {
    label: 'Refresh Data',
    execute: (args: ReadonlyPartialJSONObject) => {
      const typedArgs = args as CommandArguments.IRefreshData;
      // Implementation using typedArgs.force
    }
  });
}
```

Then in `src/index.ts`:

```typescript
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { registerCommands, CommandIDs, CommandArguments } from './commands';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_braket_devices:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    // Register all commands with JupyterLab's command registry
    registerCommands(app);

    // Commands are now registered and can be executed anywhere:
    // - From the command palette
    // - From menus
    // - Programmatically via app.commands.execute()

    // ... rest of activation (e.g., add to palette, create widgets, etc.)
  }
};

export default plugin;
```

**Executing commands with typed arguments:**

```typescript
import { CommandIDs, CommandArguments } from './commands';

// Execute with typed arguments
await app.commands.execute(CommandIDs.openPanel, {
  filePath: '/path/to/file'
} as CommandArguments.IOpenPanel);

// Execute without arguments
await app.commands.execute(CommandIDs.refreshData);
```

**Notes:**

- Accept `ReadonlyPartialJSONObject` in the execute function signature (required by Lumino)
- Cast to your typed interface inside the function for type safety
- Use namespaces (`CommandIDs`, `CommandArguments`) to organize related constants and types
- This pattern matches how popular extensions like `jupyterlab-git` handle commands

**✅ Do**: For simple extensions with 1-2 commands, you can define them directly in `src/index.ts`

**❌ Don't**: Use generic IDs like `'mycommand'` or mix casing styles

### File Organization

**✅ Do**: Organize related files into directories and name by their purpose

- Widget components: `src/widgets/DataPanel.tsx` (class `DataPanel`)
- Command definitions (for multiple commands): `src/commands.ts` with `COMMANDS` mapping
- API utilities: `src/api.ts` (not `src/utils.ts`)
- Backend routes: `jupyterlab_braket_devices/routes.py` (class `DataRouteHandler`)
- Frontend logic: `src/` directory
- Python package: `jupyterlab_braket_devices/` directory

**❌ Don't**: Create catch-all files or directories like `utils.ts` or `helpers.py` or `handlers.py` — partition by feature instead

## Backend–Frontend Integration

### Integration Workflow (Critical!)

When connecting frontend and backend, **ALWAYS follow this order**:

1. **Read the backend first** — Check `jupyterlab_braket_devices/routes.py` to understand the existing API contract
2. **Write frontend to match** — Create TypeScript interfaces in `src/api.ts` that match backend responses exactly
3. **Or modify backend intentionally** — If changing the backend, update it first, then write matching frontend code

**Why this matters**: Writing frontend code based on assumptions leads to field name mismatches (e.g., expecting `message` when backend returns `data`), causing empty widgets and debugging cycles. Always verify the actual backend response format first.

### Backend Routes

Create RESTful endpoints in `jupyterlab_braket_devices/routes.py`:

**✅ Do**: Extend `APIHandler` from `jupyter_server.base.handlers`

```python
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

class DataRouteHandler(APIHandler):
    def get(self):
        """Handle GET requests."""
        result = {"status": "success", "data": "Hello"}
        self.finish(result)

    def post(self):
        """Handle POST requests."""
        body = self.get_json_body()
        # Process body...
        self.finish({"status": "success"})

def setup_route_handlers(web_app):
    base_url = web_app.settings.get("base_url", "/")
    data_route = url_path_join(base_url, "jupyterlab_braket_devices", "data")
    web_app.add_handlers(r".*$", [(data_route, DataRouteHandler)])
```

**✅ Do**: Include error handling in route handlers

**❌ Don't**:

- Hardcode URL paths — always use `url_path_join()`
- Use plain `tornado.web.RequestHandler` — instead, use `APIHandler` from `jupyter_server.base.handlers`

### Frontend API Calls

**✅ Do**: Call backend endpoints from typed API functions in `src/api.ts` (not directly in widgets):

```ts
import { ServerConnection } from '@jupyterlab/services';
import { requestAPI } from './request';

interface DataResponse {
  status: 'success' | 'error';
  data: string;
}

export async function fetchData(): Promise<string> {
  try {
    const response = await requestAPI<DataResponse>('data', {
      method: 'GET'
    });
    if (response.status === 'error') {
      throw new Error('Server returned error');
    }
    return response.data;
  } catch (err) {
    // Extract detailed error information from ResponseError
    if (err instanceof ServerConnection.ResponseError) {
      const status = err.response.status;
      let detail = err.message;

      // Truncate HTML responses for cleaner error messages
      if (
        typeof detail === 'string' &&
        (detail.includes('<!DOCTYPE') || detail.includes('<html'))
      ) {
        detail = `HTML error page (${detail.substring(0, 100)}...)`;
      }

      throw new Error(`API request failed (${status}): ${detail}`);
    }

    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`API request failed: ${msg}`);
  }
}
```

**✅ Do**:

- Always wrap API calls in try-catch blocks with proper error handling
- Check for `ServerConnection.ResponseError` to extract HTTP status codes and response details
- Handle HTML error responses gracefully by truncating them (they're often unhelpful error pages)
- Include response status codes in error messages for better debugging
- Use matching response types between Python and TypeScript
- Create typed API wrapper functions in `src/api.ts` instead of calling `requestAPI()` directly from widgets

### API Sync and Naming

**✅ Do**: Keep backend and frontend in sync

- Match JSON keys: `{"result": ...}` in Python → `response.result` in TypeScript
- Update TypeScript interfaces when changing Python responses
- Define matching endpoint path strings (e.g., `"hello"`, `"get-data"`) in both `jupyterlab_braket_devices/routes.py` and `src/api.ts` to ensure routes sync between backend and frontend

**❌ Don't**:

- Create unused routes or orphaned API calls
- Use inconsistent field naming across languages

## Development Workflow

### Environment Setup and Activation

This project **recommends using Pixi** for development as it manages both Python and Node.js dependencies in a unified environment.

#### Using Pixi (Recommended)

**No activation needed!** Simply use `pixi run <command>` or `pixi run <task-name>` for any command. Pixi automatically activates the environment.

```bash
# Examples:
pixi run build          # Run the build task
pixi run lab            # Start JupyterLab
pixi run jlpm install   # Run jlpm commands
pixi run pytest         # Run Python tests

# Or open a shell with the environment activated:
pixi shell
```

#### Using Traditional Environments (Alternative)

If you're not using Pixi, **you must activate your environment before ANY command**:

```bash
# For conda/mamba/micromamba:
conda activate <environment-name>

# For venv:
source <path-to-venv>/bin/activate  # On macOS/Linux
<path-to-venv>\Scripts\activate.bat # On Windows

# For UV:
source .venv/bin/activate  # On macOS/Linux (after 'uv venv')
.venv\Scripts\activate.bat # On Windows
```

**All `jlpm`, `pip`, and `jupyter` commands MUST run within the activated environment.**

**Symptoms of running outside the environment:**

- `jlpm: command not found`
- Extension not appearing after build
- `jupyter: command not found`

**✅ Do**: Always activate your environment first
**❌ Don't**: Run commands in your base/system environment

---

### Complete Development Workflow Checklist

**When implementing a new feature from scratch:**

#### With Pixi (Recommended)

1. **Write your code** (TypeScript in `src/`, styles in `style/`, Python in `jupyterlab_braket_devices/`)
2. **Install new dependencies** (if you added any):
   ```bash
   pixi run jlpm install  # For package.json changes
   ```
3. **Build the extension**:
   ```bash
   pixi run build
   ```
4. **Start JupyterLab and test**:
   ```bash
   pixi run lab
   ```
5. **Verify** the feature works in your browser

**Note**: The extension is already registered during initial setup. You only need to build and restart JupyterLab.

#### With Traditional Environments

1. **Activate your environment** (conda/venv/UV)
2. **Write your code**
3. **Install new dependencies** (if any):
   ```bash
   jlpm install  # For package.json changes
   ```
4. **Build**:
   ```bash
   jlpm build
   ```
5. **Start JupyterLab**:
   ```bash
   jupyter lab
   ```
6. **Verify** in browser

**Critical**: Building compiles your code, but JupyterLab must be restarted to load the changes!

---

### Understanding Build vs Install

Many issues arise from confusing these two steps:

#### `jlpm build` — Compiles the Extension. Do this every time you change TypeScript code.

- **What it does**: Compiles TypeScript → JavaScript, bundles the extension
- **Output**: Creates files in `lib/` and `jupyterlab_braket_devices/labextension/`
- **What it does NOT do**: Register the extension with JupyterLab

#### `pip install -e .` (or `pixi run pip install -e .`) + `jupyter labextension develop .` — Registers the Extension. Do this once as a setup step.

- **What it does**: Tells JupyterLab where to find your extension
- **Output**: Creates symlinks so changes are reflected
- **Note**: Also installs the Python package in editable mode
- **Result**: Extension appears in JupyterLab

**You need BOTH steps!** Building prepares the code; installing registers it with JupyterLab.

**Common mistake**: Running only `jlpm build` and expecting the extension to appear. It won't show up until you also run the installation commands.

---

### Initial Setup (run once)

#### Using Pixi (Recommended)

This project includes a `pixi.toml` configuration with predefined tasks for common operations.

```bash
# Install all dependencies
pixi install

# Install the extension in development mode
pixi run jupyter labextension develop . --overwrite

# Build the frontend extension
pixi run jlpm install
pixi run jlpm build
```

**Available Pixi tasks:**
- `pixi run build` - Build the extension
- `pixi run lab` - Start JupyterLab
- `pixi run test` - Run Python tests
- `pixi run lint` - Lint the code

#### Using Traditional Environments (Alternative)

```bash
# Create and activate environment (choose one):
python -m venv .venv && source .venv/bin/activate  # venv
# conda create -n myenv python=3.10 && conda activate myenv  # conda
# uv venv && source .venv/bin/activate  # UV

# Install dependencies
pip install -e ".[dev,test]"
jlpm install

# Register extension with JupyterLab
jupyter labextension develop . --overwrite
jupyter server extension enable jupyterlab_braket_devices

# Build
jlpm build
```

### Iterative Development

#### Development with Auto-Rebuild (Recommended)

The most efficient workflow uses watch mode to automatically rebuild on file changes:

**With Pixi:**
```bash
# Terminal 1: Auto-rebuild on changes
pixi run watch

# Terminal 2: Run JupyterLab
pixi run lab
```

**With Traditional Environments:**
```bash
# Terminal 1: Auto-rebuild on changes
jlpm run watch

# Terminal 2: Run JupyterLab
jupyter lab
```

#### After Making Changes

**After editing TypeScript** (files in `src/`):
- If using watch mode: Simply **refresh your browser** (Cmd+R / Ctrl+R)
- If not using watch:
  - Pixi: Run `pixi run build`, then **refresh browser**
  - Traditional: Run `jlpm build`, then **refresh browser**

**After editing Python** (files in `jupyterlab_braket_devices/`):
- **Restart the JupyterLab server** (Ctrl+C, then `pixi run lab` or `jupyter lab` again)
- No rebuild needed!
- Only re-run installation (`pixi install` or `pip install -e .`) if you changed package structure in `pyproject.toml`

**Quick TypeScript validation** (optional):
```bash
# Pixi:
pixi run npx tsc --noEmit src/index.ts

# Traditional:
npx tsc --noEmit src/index.ts
```

**Memory aid**: "What did you change? Restart that!"
- Changed **JavaScript/TypeScript** → Build (or auto-rebuilds with watch) → **Refresh browser**
- Changed **Python** → **Restart JupyterLab server** (no build needed)

### Debugging and Diagnostics

#### Check Extension Installation

```bash
# Pixi:
pixi run jupyter labextension list        # Check frontend extension
pixi run jupyter server extension list    # Check backend extension

# Traditional:
jupyter labextension list
jupyter server extension list
```

Your extension should appear as **"enabled"** and **"OK"**.

#### Lint Code

```bash
# Pixi:
pixi run lint                # Use defined task
# Or: pixi run jlpm run lint

# Traditional:
jlpm run lint
```

#### Debug in Browser

**Browser console** (ask user to check):
- Open browser console (F12 or Cmd+Option+I)
- Look for JavaScript errors or warnings
- Check for failed network requests to backend endpoints
- Search for the extension ID (`jupyterlab_braket_devices`) to verify it loaded

**Server logs** (terminal running JupyterLab):
- Check for Python errors or exceptions
- Verify backend routes are registered
- Look for HTTP request logs

---

### Troubleshooting: Extension Not Appearing

If your extension doesn't appear in JupyterLab after building:

**1. Check if the extension is installed:**

```bash
# Pixi:
pixi run jupyter labextension list

# Traditional:
jupyter labextension list
```

Your extension should appear as **"enabled"** and **"OK"**.

**2. If NOT in the list**, re-run installation:

```bash
# Pixi:
pixi run jupyter labextension develop . --overwrite

# Traditional:
jupyter labextension develop . --overwrite
jupyter server extension enable jupyterlab_braket_devices
```

**3. Did you restart JupyterLab?**
- Full restart required (Ctrl+C, then `pixi run lab` or `jupyter lab`)
- Simply refreshing the browser is NOT enough

**4. Check the browser console** (F12 or Cmd+Option+I):
- Look for JavaScript errors
- Search for `jupyterlab_braket_devices` to verify it loaded
- Report any error messages or warnings

**5. Verify build output:**
```bash
ls -la lib/                                      # Should contain .js files
ls -la jupyterlab_braket_devices/labextension/  # Should contain bundled extension
```

**6. If still not working**, try a clean rebuild (see Reset section below)

**Common causes:**
- ❌ Only ran build without installation/registration commands
- ❌ Forgot to restart JupyterLab after installation
- ❌ Running commands outside activated environment (if not using Pixi)
- ❌ Build errors that were missed (check terminal output)

### Reset (if build state is broken)

If you encounter persistent build issues, perform a clean rebuild:

**With Pixi:**
```bash
# Clean build artifacts
pixi run jlpm clean:all

# Optional: Remove all ignored files (node_modules, etc.)
# git clean -fdX

# Reinstall and rebuild
pixi install
pixi run jlpm install
pixi run jlpm build
pixi run jupyter labextension develop . --overwrite
```

**With Traditional Environments:**
```bash
# Clean build artifacts
jlpm clean:all

# Optional: Remove all ignored files
# git clean -fdX

# Reinstall and rebuild
jlpm install
jlpm build
pip install -e ".[dev,test]"
jupyter labextension develop . --overwrite
jupyter server extension enable jupyterlab_braket_devices
```

### Environment Notes

**✅ Do**: Use **Pixi** for this project (recommended)
- Manages both Python and Node.js in a unified environment
- No manual activation needed - use `pixi run <command>`
- Reproducible builds with lockfiles (`pixi.lock`)
- Fast dependency resolution (built on conda/mamba)
- Built-in task runner (`pixi run build`, `pixi run lab`, etc.)

**✅ Do**: Use traditional environments if you prefer
- Options: conda, mamba, micromamba, venv, UV
- **Must manually activate** before running commands
- Manage Python and Node.js separately

**✅ Do**: Use `jlpm` exclusively for JavaScript/TypeScript
- Never use `npm` or `yarn` directly
- This ensures yarn.lock consistency

**❌ Don't**: Mix package managers
- Don't use `package-lock.json` (this project uses `yarn.lock`)
- Don't run `npm install` directly (use `jlpm` or `pixi run jlpm`)
- Don't mix pip/UV/Pixi in the same environment

## Best Practices

### Project Structure Alignment

**✅ Do**: Follow the template structure

- Keep configuration files in project root: `package.json`, `pyproject.toml`, `tsconfig.json`
- Backend routes: `jupyterlab_braket_devices/routes.py`
- Server extension config: `jupyter-config/server-config/jupyterlab_braket_devices.json`
- Frontend code: `src/index.ts` and other `src/` files
- Styles: `style/index.css`

**❌ Don't**: Rename or move core files without updating all references in configuration

### Version Management

**✅ Do**: Update version in `package.json` only

- The `package.json` version is the source of truth
- `pyproject.toml` automatically syncs from `package.json` via `hatch-nodejs-version`
- Follow semantic versioning: MAJOR.MINOR.PATCH

**❌ Don't**: Manually edit version in `pyproject.toml` — it's dynamically sourced from `package.json`

**Note**: Releases are handled by GitHub Actions, not manually. AI agents should only update versions when explicitly requested by the user.

### Development Approach

**✅ Do**: Start simple and iterate

- Begin with minimal functionality (e.g., a single command or widget)
- **When integrating backend/frontend**: See [Integration Workflow](#integration-workflow-critical) for the correct order
- Add backend routes or verbs only when frontend needs them
- Test in running JupyterLab frequently
- Ask user to check browser console and review terminal logs for errors

**❌ Don't**: Build complex features without incremental testing

**❌ Don't**: Write frontend interfaces without first checking the backend API contract in `jupyterlab_braket_devices/routes.py`

## Common Pitfalls

### Package Management

**✅ Do**: Use consistent package managers

**For this project with Pixi:**
```bash
pixi install               # Install all dependencies (Python + Node.js)
pixi run jlpm install      # Install JS dependencies
pixi run build             # Build the extension
pixi run lab               # Start JupyterLab
```

**With traditional environments:**
```bash
pip install -e ".[dev,test]"  # Python dependencies
jlpm install                   # JS dependencies
jlpm build                     # Build
jupyter lab                    # Start JupyterLab
```

**❌ Don't**: Mix package managers or lockfiles
- ❌ Don't use `npm` or `yarn` directly - always use `jlpm`
- ❌ Don't create `package-lock.json` (this project uses `yarn.lock`)
- ❌ Don't mix pip/UV/Pixi in the same environment
- ❌ Don't mix conda and pip unless you know what you're doing

### Path Handling

**✅ Do**: Use relative imports in TypeScript (`src/` files)

```typescript
import { MyWidget } from './widgets/MyWidget';
```

**❌ Don't**: Use absolute paths or assume specific directory structures

### Error Handling

**✅ Do**: Wrap async operations in try-catch (in `src/api.ts`, widget code)

```typescript
try {
  const data = await fetchData();
} catch (err) {
  showErrorMessage('Failed to fetch data');
}
```

**❌ Don't**: Let errors propagate silently or crash the extension

### CSS and Styling

**✅ Do**: Namespace all CSS in `style/index.css`

```css
.jp-jupyterlab-braket-devices-widget {
  padding: 8px;
}
```

**❌ Don't**: Use generic class names like `.widget` or `.button`

### Resource Cleanup

**✅ Do**: Dispose resources in widget `dispose()` methods

```typescript
dispose(): void {
  this._signal.disconnect();
  super.dispose();
}
```

**❌ Don't**: Leave event listeners or signal connections active after disposal

### Backend Integration

**✅ Do**: Use relative imports within your package

```python
from .routes import setup_route_handlers
```

**❌ Don't**: Use absolute imports like `from jupyterlab_braket_devices.routes import ...`

## Quick Reference

### Key Identifiers

Use these patterns consistently throughout your code:

- **Plugin ID** (in `src/index.ts`): `'jupyterlab_braket_devices:plugin'`
- **Command IDs** (in `src/commands.ts` or `src/index.ts`): `'jupyterlab_braket_devices:command-name'`
  - For multiple commands, create `src/commands.ts` with a centralized `COMMANDS` mapping
  - For 1-2 commands, define directly in `src/index.ts`
- **CSS classes** (in `style/index.css`): `.jp-jupyterlab-braket-devices-ClassName`
- **API routes** (in `jupyterlab_braket_devices/routes.py`): `url_path_join(base_url, "jupyterlab_braket_devices", "endpoint")`

### Essential Commands

See [Development Workflow](#development-workflow) section for full command reference.
