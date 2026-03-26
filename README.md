<div align="center">

<br/>

<img src="public/logo-morado-sin-fondo.png" alt="MACMCleaner Logo" width="100"/>

<br/>

# MACMCleaner

### *Free your disk. Keep your privacy.*

**A safe, open-source, privacy-first Windows system cleaner — built from scratch in Tauri v2 and Rust.**

<br/>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)
[![Platform](https://img.shields.io/badge/Windows-10%20%2F%2011-0078d4?style=for-the-badge&logo=windows)](https://github.com/miguelacm/macmcleaner/releases)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-ffc131?style=for-the-badge&logo=tauri)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Backend-Rust-CE412B?style=for-the-badge&logo=rust)](https://www.rust-lang.org)
[![100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline-22c55e?style=for-the-badge&logo=shield)](https://github.com/miguelacm/macmcleaner)

<br/>

[**⬇ Download**](https://github.com/miguelacm/macmcleaner/releases) &nbsp;·&nbsp;
[**✨ Features**](#-features) &nbsp;·&nbsp;
[**🔒 Safety System**](#-safety-system) &nbsp;·&nbsp;
[**🛠 Build from Source**](#-building-from-source) &nbsp;·&nbsp;
[**🌐 miguelacm.es**](https://miguelacm.es)

<br/>

</div>

---

## 📖 Overview

**MACMCleaner** is a Windows system cleaner designed around a single philosophy: **you should always know exactly what is being deleted and why, before it happens.**

Unlike many cleaners that silently delete files in the background or bundle hidden software, MACMCleaner shows every scanned file in a transparent, reviewable list — grouped by category, sortable, filterable — and only proceeds after explicit confirmation. Nothing is deleted until you say so.

The backend is written entirely in **Rust**, which ensures memory safety, predictable performance, and zero runtime overhead. The frontend is a **React** web app rendered through Microsoft's **WebView2** engine via the **Tauri v2** framework, giving it a native Windows feel without sacrificing the flexibility of a modern UI stack. The result is a lightweight app (~8 MB installer) that can scan tens of thousands of files without freezing the interface.

MACMCleaner is **100% offline** — it makes zero network connections at any point during its lifecycle. No telemetry, no crash reporting, no update pings, no analytics. What happens on your machine stays on your machine.

---

## ✨ Features

### Cleaning categories

| Category | Scope | What it removes |
|---|---|---|
| **Temporary Files** | `%TEMP%`, `%TMP%`, `C:\Windows\Temp` | Files and subdirectories created by Windows and applications during normal operation |
| **Browser Cache** | Chrome, Edge, Firefox, Brave | Network cache (`Cache_Data`, `cache2/entries`) — never cookies, history, passwords or bookmarks |
| **System Junk** | `C:\Windows\Prefetch`, `C:\Windows\Logs`, Explorer thumbnails | `.pf` prefetch files, `.log` and `.etl` event traces, `thumbcache_*.db` thumbnail databases |
| **Recycle Bin** | Current user's recycle bin | All pending deleted items, with size preview before confirmation |

### Scan engine
- **Non-destructive scan** — the scan phase is strictly read-only. No file is modified or deleted during analysis
- **Real-time progress** — the UI updates live with the current category, file count, and percentage as scanning happens on a separate thread
- **Category-specific filters** — each cleaner applies its own rules. The browser cleaner, for example, explicitly blocks `Bookmarks`, `Cookies`, `History`, `Login Data`, `Web Data` and 6 more protected filenames, regardless of path
- **Temp directory intelligence** — instead of listing tens of thousands of individual files inside `%TEMP%`, the scanner enumerates first-level items (files and subdirectories). Subdirectories are presented as single deletable units with their total aggregated size, resulting in cleaner results and faster deletion

### Results & UI
- **Grouped by category** — results are organized into collapsible accordion sections
- **File-level control** — select or deselect individual files, or toggle entire categories at once with indeterminate checkbox state support
- **Sorting** — sort any category by size (largest first), modification date (most recent), or name (alphabetical)
- **Path filtering** — real-time filter across all visible paths
- **Pagination guard** — categories with more than 100 items paginate automatically to prevent UI slowdown, with a "Show N more..." control
- **Size display** — every file and category shows human-readable sizes (B / KB / MB / GB)

### Cleaning engine
- **Confirmation dialog** — shows exact file count and total size before proceeding
- **Graceful error handling** — files locked by running processes are skipped with a note. Errors are counted and reported at the end, with an explanation that this is normal behavior (browsers hold cache files open while running)
- **Recycle bin support** — emptied via a native Windows PowerShell call, not just file deletion, ensuring proper cleanup

### User experience
- **First-run setup** — language selector (Spanish / English) → Terms & Conditions → main app
- **Persistent settings** — language preference, path exclusions, and scan statistics (total cleaned, scan count, last scan date) are saved across sessions
- **Path exclusions** — any folder can be permanently excluded from future scans via a folder picker dialog
- **System tray** — the app minimizes to tray instead of closing, with Show / Quit options
- **Admin elevation** — requests administrator rights at launch via an embedded Windows application manifest, enabling cleanup of system-protected directories like `C:\Windows\Prefetch`
- **Two languages** — full Spanish and English translations for every visible string, switchable at any time from Settings without restarting

### Design & performance
- **Frameless custom window** — native window controls (minimize, maximize, close) implemented in React, with `data-tauri-drag-region` for window dragging
- **Neon dark theme** — deep dark background with ambient cyan glow, cyan→magenta gradient accents, neon progress bar, and glowing sidebar navigation indicator
- **Animations** — page transitions and accordion animations powered by Framer Motion, with deferred list rendering to maintain 60fps on large scan results
- **Memoized selectors** — `useMemo` on selected file paths and total size calculations to avoid recalculating on every render
- **Scan throttle** — the Rust scanner yields every 50 files (`thread::sleep(1ms)`) to avoid pegging the CPU and blocking the event loop

---

## 🔒 Safety System

The safety system is the most critical component of MACMCleaner. It is implemented in [`src-tauri/src/safety/mod.rs`](src-tauri/src/safety/mod.rs) and runs at two independent checkpoints: **during scan** (to filter what is shown to the user) and **immediately before deletion** (to reject any path that doesn't pass validation, regardless of how it ended up in the delete list).

### The three-layer validation chain

```
User clicks "Clean selected"
         │
         ▼
┌─────────────────────────────┐
│  1. User exclusions          │  ← Highest priority. If a path starts with
│     (runtime check)          │    any excluded prefix, it is rejected.
└─────────────────────────────┘
         │ passes
         ▼
┌─────────────────────────────┐
│  2. Whitelist override       │  ← Explicit allowed prefixes (Temp, Prefetch,
│     (allowlist check)        │    Logs, browser cache subdirs, etc.).
│                              │    A path starting with a whitelisted prefix
│                              │    is allowed, BUT still checked against
│                              │    blacklisted filenames (step 3b).
└─────────────────────────────┘
         │ not in whitelist
         ▼
┌─────────────────────────────┐
│  3. Blacklist prefixes       │  ← Critical system directories that must
│     (blocklist check)        │    never be touched under any circumstances.
└─────────────────────────────┘
         │ not blacklisted
         ▼
┌─────────────────────────────┐
│  3b. Blacklisted filenames   │  ← Individual filenames blocked regardless
│      (filename check)        │    of location (ntoskrnl.exe, pagefile.sys…)
└─────────────────────────────┘
         │ passes all checks
         ▼
       DELETE
```

### Blacklisted paths — never touched

These directory prefixes are **absolutely blocked**. No file path that starts with any of these will ever be scanned or deleted:

```
C:\Windows\System32          ← Core OS binaries and DLLs
C:\Windows\SysWOW64          ← 32-bit compatibility layer
C:\Windows\WinSxS            ← Side-by-side component store
C:\Windows\Boot              ← Bootloader files
C:\Windows\Fonts             ← System typefaces
C:\Windows\servicing         ← Windows Update components
C:\Windows\INF               ← Hardware driver information
C:\Windows\security          ← Security policy database
C:\Windows\System32\config   ← Registry hives (live)
C:\Windows\System32\drivers  ← Kernel-mode drivers
C:\Program Files             ← 64-bit installed applications
C:\Program Files (x86)       ← 32-bit installed applications
%USERPROFILE%\Documents      ← User documents
%USERPROFILE%\Desktop        ← User desktop
%USERPROFILE%\Downloads      ← User downloads
%USERPROFILE%\Pictures       ← User pictures
%USERPROFILE%\Videos         ← User videos
%USERPROFILE%\Music          ← User music
%USERPROFILE%\OneDrive       ← Cloud-synced files
%USERPROFILE%\Saved Games    ← Game saves
%USERPROFILE%\Contacts       ← Contacts
%USERPROFILE%\Favorites      ← Browser favorites
%USERPROFILE%\Links          ← Shell links
C:\Boot                      ← Boot configuration data
C:\Recovery                  ← Windows Recovery Environment
C:\EFI                       ← EFI system partition (if mounted)
```

### Whitelisted paths — explicitly allowed

These prefixes are the **only** locations MACMCleaner will clean. They are expanded at runtime from environment variables so they always resolve correctly regardless of Windows installation path:

```
%SystemRoot%\Temp            ← Windows system temp
%SystemRoot%\Prefetch        ← Application prefetch cache
%SystemRoot%\SoftwareDistribution\Download  ← Windows Update download cache
%SystemRoot%\Logs            ← Windows event and diagnostic logs
%LOCALAPPDATA%\Temp          ← User-level temp directory
%LOCALAPPDATA%\Google\Chrome\User Data       ← Chrome (cache subdirs only)
%LOCALAPPDATA%\Microsoft\Edge\User Data      ← Edge (cache subdirs only)
%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data  ← Brave
%LOCALAPPDATA%\Mozilla\Firefox\Profiles     ← Firefox
%LOCALAPPDATA%\Microsoft\Windows\Explorer   ← Thumbnail cache
$TEMP, $TMP                  ← Additional temp env vars if set
```

### Blacklisted filenames

Regardless of location, these filenames are **never deleted**:

| Filename | Description |
|---|---|
| `ntoskrnl.exe` | Windows kernel |
| `hal.dll` | Hardware Abstraction Layer |
| `bootmgr` | Boot Manager |
| `ntldr` | NT Loader (legacy) |
| `boot.ini` | Boot configuration (legacy) |
| `pagefile.sys` | Virtual memory paging file |
| `hiberfil.sys` | Hibernation image |
| `swapfile.sys` | Modern standby swap file |
| `ntuser.dat` | User registry hive |
| `usrclass.dat` | User class registry hive |
| `system`, `sam`, `security`, `software`, `default` | Live registry hive files |

### Browser safety specifics

The browser cleaner navigates into browser User Data directories and applies an additional filename blocklist to prevent accidental deletion of any file that could corrupt user profiles:

**Blocked browser filenames (exact match, case-insensitive):**
`bookmarks`, `cookies`, `history`, `login data`, `web data`, `preferences`, `favicons`, `shortcuts`, `top sites`, `visited links`, `network action predictor`

---

## 🔐 Privacy & Legal Compliance

### Zero network footprint

MACMCleaner makes **absolutely zero network connections**. This is enforced at the architectural level — the app has no HTTP client, no DNS resolver, no socket usage of any kind. The Content Security Policy embedded in `tauri.conf.json` does not include `connect-src`, making any fetch or XHR to an external origin a CSP violation that would be blocked even if the code tried.

The only external resource loaded is Google Fonts via `fonts.googleapis.com` — and this is declared in the CSP to allow stylesheet and font loading over `https`. It is the sole exception and is necessary for the UI font (Inter). **Removing even this is possible** for fully air-gapped deployments by replacing the `@import` with a local font file.

### GDPR compliance (EU Regulation 2016/679)

MACMCleaner does not process any personal data as defined by GDPR Article 4(1). There is no:
- Collection of identifiable user data
- Transmission of data to any controller or processor
- Storage of data outside the local machine
- Profiling, analytics, or behavioral tracking of any kind

The app stores one configuration file in `%APPDATA%\es.miguelacm.macmcleaner\config.json` containing only functional settings (language preference, exclusion paths, aggregate statistics). This file never leaves the user's machine.

### LOPD compliance (Spain — Ley Orgánica 3/2018)

As a Spanish-developed application, MACMCleaner is designed to be fully compatible with Spain's Organic Law on Personal Data Protection and Digital Rights Guarantee (LOPD-GDD), which implements and expands GDPR within Spanish jurisdiction. The same zero-data-collection architecture that satisfies GDPR satisfies LOPD.

### EU Product Liability Directive

The forthcoming EU directive on product liability (scheduled to take effect December 2026) creates liability for digital products, including software. MACMCleaner addresses this through:
- **GPL v3 distribution** — free/open-source software provided without warranty is explicitly addressed in the directive
- **Terms & Conditions** — displayed and explicitly accepted at first launch, including a clear AS-IS disclaimer and user responsibility clause
- **No autonomous deletion** — every deletion requires explicit user confirmation; the app never deletes anything without user action

---

## 📦 Installation

### For end users

1. Go to the [**Releases**](https://github.com/miguelacm/macmcleaner/releases) page
2. Download `MACMCleaner_1.0.0_x64_en-US.msi`
3. Double-click the installer — Windows will request administrator permission
4. Follow the setup wizard (takes under 30 seconds)
5. Launch MACMCleaner from the Start Menu

**System requirements:**
- Windows 10 (64-bit) version 1903 or later, or Windows 11
- Microsoft WebView2 Runtime (pre-installed on Windows 11; the installer handles Windows 10)
- ~50 MB disk space

> The app requests administrator rights at launch (not just install) because cleaning `C:\Windows\Prefetch`, `C:\Windows\Logs`, and other system directories requires elevated privileges. This is declared in the embedded Windows application manifest and triggers a standard UAC prompt.

---

## 🛠 Building from Source

### Prerequisites

| Requirement | Version | Download | Notes |
|---|---|---|---|
| **Node.js** | 20 LTS+ | [nodejs.org](https://nodejs.org) | Includes npm |
| **Rust** (stable) | 1.77.2+ | [rustup.rs](https://rustup.rs) | Install via rustup |
| **VS Build Tools** | 2019+ | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | Workload: **Desktop development with C++** |
| **WebView2 Runtime** | latest | Bundled on Win 11 | For Windows 10 only |

> ⚠️ **Critical — Windows linker conflict:**
> Rust on Windows requires the MSVC linker (`link.exe` from Visual Studio). Git Bash ships its own `link.exe` (a GNU symlink utility) that shadows MSVC's linker when Git Bash is in `PATH`. **Always compile from Developer PowerShell for Visual Studio** or an x64 Native Tools Command Prompt — never from Git Bash or plain PowerShell.

### Clone and install

```bash
git clone https://github.com/miguelacm/macmcleaner.git
cd macmcleaner
npm install
```

### Development (hot-reload)

Open **Developer PowerShell for Visual Studio** as **Administrator** (admin required to test system file cleaning):

```powershell
npx tauri dev
```

What happens:
1. Vite starts a dev server on `http://localhost:5173`
2. Cargo compiles the Rust backend (~40s on first run, ~3s incremental)
3. A UAC prompt appears — accept it to run with admin rights
4. The app opens and connects to the Vite dev server
5. Frontend changes hot-reload instantly; Rust changes trigger an incremental recompile

### Production build

From **Developer PowerShell for Visual Studio** as **Administrator**:

```powershell
npx tauri build
```

This runs:
1. `npm run build` → Vite compiles and bundles the React frontend (oxc minifier, tree-shaking)
2. `cargo build --release` → Rust compiles with LTO, codegen-units=1, panic=abort, opt-level="s" (size-optimized)
3. WiX Toolset bundles everything into an MSI installer

Output: `src-tauri/target/release/bundle/msi/MACMCleaner_1.0.0_x64_en-US.msi`

> **Expected sizes:**
> - JavaScript bundle: ~430 KB (gzipped ~140 KB)
> - Rust binary (release): ~8–12 MB
> - MSI installer: ~4–6 MB

---

## 🏗 Architecture

### Overview

MACMCleaner follows a strict process isolation model inherent to Tauri's design: the Rust backend runs as a native Windows process with full system access, while the React frontend runs sandboxed inside a WebView2 instance. They communicate exclusively through Tauri's typed IPC layer — the frontend calls named commands, the backend executes them and returns serialized results.

```
┌────────────────────────────────────────────────────────────┐
│                    Windows Process                          │
│                                                            │
│  ┌──────────────────────┐    IPC     ┌──────────────────┐  │
│  │   WebView2 (frontend) │ ◄──────► │  Rust (backend)  │  │
│  │                       │  invoke   │                  │  │
│  │  React + TypeScript   │  events   │  Tauri commands  │  │
│  │  Zustand state        │           │  Scanner engine  │  │
│  │  Framer Motion UI     │           │  Cleaner modules │  │
│  │  i18next (ES/EN)      │           │  Safety system   │  │
│  └──────────────────────┘           └──────────────────┘  │
│                                                            │
│                   Windows APIs (via Rust)                  │
│         File system · Recycle Bin · Registry               │
└────────────────────────────────────────────────────────────┘
```

### Frontend structure

```
src/
├── App.tsx                     # Root — manages first-run flow (welcome → terms → app)
├── main.tsx                    # ReactDOM entry point
├── i18n.ts                     # i18next config — loads ES/EN JSON namespaces
│
├── store/
│   └── useAppStore.ts          # Zustand global store — all app state in one place
│                               # (config, currentPage, scanResult, selectedFiles,
│                               #  sortOption, filterText, isScanning, scanProgress…)
│
├── hooks/
│   └── useTauri.ts             # IPC bridge — wraps every invoke() call with types
│                               # Exports: loadConfig, saveConfig, startScan,
│                               #          cleanFiles, onScanProgress
│
├── components/
│   ├── layout/
│   │   ├── TitleBar.tsx        # Frameless window chrome (drag region, window controls)
│   │   ├── Sidebar.tsx         # Navigation + author credit + website CTA
│   │   └── Layout.tsx          # Shell that wraps sidebar + page content + toast stack
│   │
│   ├── ui/                     # Reusable design system components
│   │   ├── Button.tsx          # Variants: primary | secondary | danger | ghost
│   │   ├── Card.tsx            # Surface with optional glow, border, click handler
│   │   ├── Badge.tsx           # Pill badge: primary | success | danger | warning | muted
│   │   ├── Modal.tsx           # Centered overlay with backdrop
│   │   ├── ProgressBar.tsx     # Animated fill with neon glow, optional label/percent
│   │   ├── Checkbox.tsx        # Three-state (checked / unchecked / indeterminate)
│   │   ├── Toast.tsx           # Auto-dismiss notification stack (top-right)
│   │   └── Icons.tsx           # SVG icon set — all inline, no external dependencies
│   │
│   ├── WelcomeModal.tsx        # Language picker (first launch only)
│   └── TermsModal.tsx          # GPL v3 + disclaimer + privacy acceptance
│
├── pages/
│   ├── Dashboard.tsx           # Hero scan button, live progress, stats, category toggles
│   ├── Results.tsx             # Scan results list with selection, sort, filter, clean
│   ├── Settings.tsx            # Language, exclusions, updates/feedback, uninstall
│   └── About.tsx               # Project info, privacy statement, GitHub link
│
├── locales/
│   ├── es.json                 # Spanish translations (default)
│   └── en.json                 # English translations
│
├── utils/
│   └── format.ts               # formatBytes(n) → "4.2 GB", formatDate(iso, locale)
│
└── styles/
    └── globals.css             # Tailwind directives + custom utilities
                                # (gradient-text, gradient-border, neon-divider,
                                #  ambient background glow, neon scrollbar)
```

### Backend structure

```
src-tauri/src/
├── main.rs                     # Binary entry point — calls lib::run()
│
├── lib.rs                      # Tauri application setup + all command handlers
│   │                           # Commands: load_config, save_config,
│   │                           #           start_scan, cancel_scan, clean_files
│   └── AppState                # Arc<AtomicBool> cancel flag shared across threads
│
├── safety/
│   └── mod.rs                  # Path validation engine
│       ├── blacklisted_prefixes()   # Absolute never-touch list
│       ├── allowed_prefixes()       # Explicit whitelist (expanded from env vars)
│       ├── blacklisted_filenames()  # Per-filename blocklist
│       └── validate_path()          # Runs the full three-layer chain
│
├── scanner/
│   └── mod.rs                  # File discovery engine
│       ├── run_scan()          # Orchestrates all categories, emits scan-progress events
│       ├── scan_paths()        # WalkDir-based scan with safety validation per file
│       ├── scan_recycle_bin()  # Queries recycle bin size/count without touching files
│       ├── dir_total_size()    # Recursive size calculation for temp subdirectories
│       └── passes_filter()     # Category-specific filename filters
│
└── cleaner/
    ├── mod.rs                  # delete_files() — iterates paths, validates, deletes
    ├── temp.rs                 # scan_paths() → %TEMP%, %TMP%, C:\Windows\Temp
    ├── browser.rs              # scan_paths() → Chrome/Edge/Firefox/Brave cache dirs
    ├── system.rs               # scan_paths() → Prefetch, Logs, Explorer thumbnails
    └── recycle.rs              # empty_recycle_bin() via PowerShell
                                # get_recycle_bin_size() + count() via Win32 API
```

### Tauri IPC commands

| Command | Direction | Description |
|---|---|---|
| `load_config` | invoke → Rust | Reads `config.json` from AppData; returns default if first launch |
| `save_config` | invoke → Rust | Serializes `AppConfig` struct and writes to disk |
| `start_scan` | invoke → Rust | Spawns blocking thread, emits `scan-progress` events, returns `ScanResult` |
| `cancel_scan` | invoke → Rust | Sets `AtomicBool` cancel flag to `true`; scanner checks this every iteration |
| `clean_files` | invoke → Rust | Validates and deletes selected paths; handles recycle bin separately |
| `scan-progress` | Rust → emit | Real-time progress updates: `{ category, files_found, current_path, progress_percent }` |

### State management

The entire frontend state lives in a single **Zustand** store (`useAppStore`). This was a deliberate choice over Context API or Redux: Zustand has zero boilerplate, no providers, supports direct selector access without re-render loops, and the flat store structure maps cleanly to the app's relatively simple state graph.

Key state slices:
- `config: AppConfig` — persisted settings (synced to disk on every change)
- `currentPage: AppPage` — drives the page router (no URL routing — it's a desktop app)
- `scanResult: ScanResult | null` — full scan output including all categories and files
- `selectedFiles: Record<string, boolean>` — O(1) lookup for checkbox state of any path
- `sortOption / filterText` — derived display state for the Results page
- `isScanning / scanProgress / scanStatus` — live scan state

---

## ⚙️ Configuration

MACMCleaner persists its configuration in the Windows standard user application data directory:

```
C:\Users\<username>\AppData\Roaming\es.miguelacm.macmcleaner\config.json
```

```json
{
  "language": "es",
  "terms_accepted": true,
  "first_launch": false,
  "exclusions": [
    "C:\\Users\\username\\AppData\\Local\\MyApp"
  ],
  "last_scan_date": "2026-03-26T14:32:11+01:00",
  "total_cleaned": 4831838208,
  "scans_performed": 12
}
```

| Field | Type | Description |
|---|---|---|
| `language` | `"es"` \| `"en"` | Active UI language |
| `terms_accepted` | `bool` | Whether the T&C have been accepted |
| `first_launch` | `bool` | Shows the language picker on next launch if true |
| `exclusions` | `string[]` | Absolute paths never scanned or cleaned |
| `last_scan_date` | `ISO 8601` | Timestamp of the most recent scan |
| `total_cleaned` | `u64` | Cumulative bytes freed across all sessions |
| `scans_performed` | `u32` | Total number of completed scans |

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **App framework** | [Tauri v2](https://tauri.app) | Native Rust backend + WebView2 frontend. ~8MB installer vs Electron's ~120MB. |
| **Frontend runtime** | React 19 | Industry-standard component model; concurrent features help with large file lists |
| **Language** | TypeScript (strict) | `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks` — catches errors at compile time |
| **Build tool** | Vite 8 | Sub-second HMR; uses oxc (Rust-based) minifier for production builds |
| **Styling** | Tailwind CSS v3 | Utility-first; design tokens in `tailwind.config.js`; zero runtime |
| **Animations** | Framer Motion | Declarative animations; `AnimatePresence` for mount/unmount transitions |
| **State** | Zustand | Minimal global store; no provider boilerplate; direct selector access |
| **i18n** | i18next + react-i18next | JSON-based translations; language switch at runtime without reload |
| **Backend** | Rust (stable) | Memory safety; fearless concurrency; zero GC pauses; direct OS API access |
| **File walking** | [walkdir](https://crates.io/crates/walkdir) | Battle-tested recursive directory iterator with configurable depth |
| **Date/time** | [chrono](https://crates.io/crates/chrono) | RFC 3339 timestamps; local timezone awareness for modification dates |
| **Paths** | [dirs](https://crates.io/crates/dirs) | Cross-version Windows AppData path resolution |
| **Serialization** | serde + serde_json | Zero-copy deserialization; derive macros for config and result structs |
| **Installer** | WiX Toolset (MSI) | Industry-standard Windows installer; supports silent install, repair, uninstall |
| **Manifest** | tauri-build + tauri-winres | Embeds Windows application manifest declaring `requireAdministrator` at build time |

---

## 🗺 Roadmap

Planned for future versions:

- [ ] **v1.1** — Scheduled cleaning (run at system startup or on a timer)
- [ ] **v1.1** — Duplicate file finder (hash-based detection in user-selected folders)
- [ ] **v1.2** — Startup manager (view and disable auto-start entries)
- [ ] **v1.2** — Disk usage visualizer (treemap of folder sizes)
- [ ] **v2.0** — Optional portable version (.exe without installer)
- [ ] **v2.0** — Plugin system for community-contributed cleaning categories

---

## 🤝 Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for code guidelines, branch conventions, and how to submit a pull request.

- **Bug reports** → [GitHub Issues](https://github.com/miguelacm/macmcleaner/issues)
- **Feature requests** → [GitHub Issues](https://github.com/miguelacm/macmcleaner/issues)
- **Security issues** → contact privately via [miguelacm.es](https://miguelacm.es) before disclosing publicly

---

## 📄 License

**MACMCleaner** is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License v3.0** as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but **WITHOUT ANY WARRANTY**; without even the implied warranty of **MERCHANTABILITY** or **FITNESS FOR A PARTICULAR PURPOSE**. See the [LICENSE](LICENSE) file for the full terms.

---

<div align="center">

**Made with ♥ in Spain by [Miguel Ángel Colorado Marin](https://miguelacm.es)**

*"Clean what's yours. Own what you run."*

</div>
