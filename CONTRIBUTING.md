# Contributing to MACMCleaner

First off — thank you for taking the time to contribute. MACMCleaner is a GPL v3 open-source project and every improvement, no matter how small, is genuinely appreciated.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [How to contribute](#how-to-contribute)
- [Development setup](#development-setup)
- [Project conventions](#project-conventions)
- [Commit style](#commit-style)
- [Pull request process](#pull-request-process)
- [Safety system guidelines](#safety-system-guidelines)
- [Adding a translation](#adding-a-translation)
- [License](#license)

---

## Code of conduct

Be respectful, constructive, and inclusive. This is a personal open-source project built and maintained by one person — please keep issues and pull requests focused and on-topic.

---

## How to contribute

### Report a bug

Open an [issue](https://github.com/miguelacm/macmcleaner/issues) and include:

- Windows version (e.g. Windows 11 23H2)
- What you did, what you expected, what actually happened
- Any error messages or screenshots if relevant
- Whether you can reproduce it reliably

### Request a feature

Open an issue with the `enhancement` label. Describe the use case, not just the solution. "I want X because Y" is more useful than "please add X."

### Submit a pull request

1. Fork the repository
2. Create a branch from `main`: `git checkout -b feat/my-feature`
3. Make your changes following the conventions below
4. Open a PR against `main` with a clear description of what and why

---

## Development setup

See [Building from source](README.md#-building-from-source) in the README for the full prerequisite list and setup steps.

Quick summary:

```powershell
# From Developer PowerShell for Visual Studio as Administrator
git clone https://github.com/miguelacm/macmcleaner.git
cd macmcleaner
npm install
npx tauri dev
```

---

## Project conventions

### Rust (backend)

- Run `cargo fmt` before committing
- Run `cargo clippy -- -D warnings` and fix all warnings
- Do not use `unwrap()` or `expect()` on any code path that handles user file system paths — return `Result` and propagate errors gracefully
- Do not use `unwrap()` on environment variable reads — always provide a fallback (see how `safety/mod.rs` handles `SystemRoot`)
- Keep modules focused: `scanner/` discovers files, `cleaner/` deletes them, `safety/` validates paths. Do not blur these boundaries
- New cleaning categories should live in `cleaner/<name>.rs` and expose a `scan_paths() -> Vec<PathBuf>` function

### TypeScript (frontend)

- `strict` mode is enabled. No `any` types, no unused variables
- All Tauri IPC calls must go through `useTauri.ts` — never call `invoke()` directly from a component
- New pages must be registered in `useAppStore.ts` (the `AppPage` type) and in `Layout.tsx`
- New UI strings must be added to **both** `src/locales/es.json` and `src/locales/en.json`
- Component props that accept React nodes must declare them as `ReactNode` (imported from `react`), not `React.ReactNode`

### Privacy — non-negotiable constraints

These rules are not style preferences. They are hard requirements:

| Rule | Reason |
|---|---|
| **No network calls** | The app must remain 100% offline. No fetch, no axios, no WebSocket |
| **No telemetry** | No analytics, no crash reporting, no usage metrics of any kind |
| **No external CDN assets** | No unpkg, jsDelivr, or similar. All assets must be bundled or served locally |
| **No user data transmitted** | Nothing the user's file system, config, or behavior leaves the machine |

Any PR that violates these constraints will be closed regardless of its other merits.

---

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary in lowercase>

[optional body]
[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, UI tweaks (no logic changes) |
| `refactor` | Code restructuring without feature/fix |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `chore` | Build system, dependency updates |

**Examples:**

```
feat: add startup manager to scan autorun entries
fix: prevent empty exclusion path from being saved
docs: add troubleshooting section to README
perf: memoize selected file paths in Results page
refactor: extract dir_total_size helper into scanner module
```

Keep the subject line under 72 characters. Use the body for context if needed.

---

## Pull request process

1. **One PR, one concern.** Don't mix a feature and a refactor in the same PR.
2. **Update documentation.** If you add a feature, update the README. If you change config fields, update the config reference.
3. **Test on real files.** If you change the scanner or cleaner, test it on actual temp/cache/system directories — not just mocked paths.
4. **Do not touch the safety system without a very good reason.** If you do, explain in detail in the PR description why the change is safe.

---

## Safety system guidelines

The safety system (`src-tauri/src/safety/mod.rs`) is the most sensitive part of the codebase. A bug here could result in deletion of user data or system files. When contributing changes to this module:

- **Adding to the blacklist** is always safe and welcome
- **Adding to the whitelist** requires justification — why is this path safe to clean?
- **Changing validation logic** requires a detailed explanation and ideally a failing test case that demonstrates the bug being fixed
- **Never remove entries** from the blacklist without an extraordinary reason
- The double-validation design (check at scan time AND at delete time) is intentional and must be preserved

---

## Adding a translation

MACMCleaner currently supports Spanish (`es`) and English (`en`). To add a new language:

1. Copy `src/locales/en.json` to `src/locales/<locale>.json` (e.g. `fr.json` for French)
2. Translate all string values (do not change the keys)
3. Register the locale in `src/i18n.ts`
4. Add a language button in `src/components/WelcomeModal.tsx` and `src/pages/Settings.tsx`
5. Update `src/locales/en.json` and `es.json` to include the language name in `welcome.french` (or equivalent key)
6. Open a PR

---

## License

By contributing to MACMCleaner, you agree that your contributions will be licensed under the **GNU General Public License v3.0** — the same license that covers the rest of the project.
