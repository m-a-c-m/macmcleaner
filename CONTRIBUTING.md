# Contributing to MACMCleaner

Thank you for your interest in contributing! MACMCleaner is a GPL v3 open-source project and contributions are welcome.

## Ways to contribute

- **Bug reports** — Open an [issue](https://github.com/miguelacm/macmcleaner/issues) with steps to reproduce
- **Feature requests** — Open an issue describing the feature and the use case
- **Pull requests** — Fork → branch → PR against `main`
- **Translations** — Add a new locale file under `src/locales/` and open a PR

## Development setup

See the [Building from source](README.md#building-from-source) section in the README.

## Code guidelines

- **Rust:** follow `cargo fmt` and `cargo clippy`. No `unwrap()` in paths that handle user files.
- **TypeScript:** `strict` mode is enabled — no `any`, no unused variables.
- **Safety first:** any change to `src-tauri/src/safety/mod.rs` must be reviewed carefully. The blacklist/whitelist is the last line of defense before file deletion.
- **No telemetry:** do not add any network calls, analytics, or tracking of any kind.
- **Privacy:** the app must remain 100% offline. Any feature that requires a network connection is out of scope.

## Commit style

```
feat: add dark mode toggle
fix: prevent empty path from passing safety check
docs: update README build instructions
refactor: simplify browser scan path resolution
```

## License

By contributing, you agree that your contributions will be licensed under the **GNU General Public License v3.0**.
