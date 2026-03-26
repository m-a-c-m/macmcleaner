<div align="center">

# MACMCleaner

**A safe, open-source, privacy-first system cleaner for Windows**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-0078d4?logo=windows)](https://github.com/miguelacm/macmcleaner/releases)
[![Made with Tauri](https://img.shields.io/badge/Made%20with-Tauri%20v2-ffc131?logo=tauri)](https://tauri.app)
[![Built with Rust](https://img.shields.io/badge/Backend-Rust-orange?logo=rust)](https://www.rust-lang.org)
[![100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline-22c55e)](https://github.com/miguelacm/macmcleaner)

*Free your disk. Keep your privacy.*

[Download](#installation) · [Features](#features) · [Build from source](#building-from-source) · [Safety system](#safety-system)

</div>

---

## What is MACMCleaner?

MACMCleaner is a free, open-source Windows system cleaner built with **Tauri v2** (Rust backend) and **React**. It scans and removes junk files — temporary files, browser cache, system logs, and recycle bin — safely and transparently, showing you everything before anything is deleted.

**No internet connection. No telemetry. No account. No surprises.**

---

## Features

### Cleaning categories
| Category | What it cleans |
|---|---|
| **Temporary Files** | `%TEMP%`, `%TMP%`, `C:\Windows\Temp` — files and subfolders |
| **Browser Cache** | Chrome, Edge, Firefox, Brave — cache only, never cookies or history |
| **System Junk** | Prefetch (`.pf`), Windows Logs (`.log`, `.etl`), Thumbnail cache |
| **Recycle Bin** | Empties the recycle bin safely |

### Core features
- **Scan before delete** — every file is shown for review before anything is removed
- **Real-time progress** — live scan progress with category, file count and percentage
- **Smart sorting & filtering** — sort by size, date or name; filter paths instantly
- **Exclusion paths** — permanently exclude any folder from future scans
- **Admin elevation** — requests administrator rights at launch so it can clean system files
- **Two languages** — English and Spanish, selectable at first launch and in Settings
- **System tray** — minimizes to tray, stays out of your way
- **Frameless UI** — custom window with neon dark theme matching [miguelacm.es](https://miguelacm.es)

### Privacy & legal
- **100% offline** — zero network connections, ever
- **No telemetry** — no analytics, no crash reporting, no tracking
- **No data collection** — nothing leaves your machine
- **GDPR & LOPD compliant** — full compliance with EU and Spanish privacy law
- **GPL v3 license** — you can inspect, fork and redistribute the source

---

## Installation

### Option A — Download installer (recommended for users)

1. Go to [Releases](https://github.com/miguelacm/macmcleaner/releases)
2. Download `MACMCleaner_1.0.0_x64_en-US.msi`
3. Run the installer — Windows will ask for administrator permission (required to clean system files)
4. Launch MACMCleaner from the Start Menu or Desktop shortcut

**Requirements:** Windows 10 / 11 (64-bit). WebView2 runtime is pre-installed on Windows 11 and is included in the installer for Windows 10.

---

## Building from source

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 20 LTS or newer | Includes npm |
| [Rust](https://rustup.rs) | stable | Via `rustup` |
| [VS Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | 2019+ | **Workload: "Desktop development with C++"** required |
| [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) | latest | Pre-installed on Windows 11 |

> **Important for Windows:** All Rust/Tauri commands must be run from **Developer PowerShell for VS** or **x64 Native Tools Command Prompt**, not from Git Bash or plain PowerShell. Git Bash ships its own `link.exe` that conflicts with MSVC.

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/miguelacm/macmcleaner.git
cd macmcleaner

# 2. Install Node dependencies
npm install
```

### Development (hot-reload)

Open **Developer PowerShell for VS 2022+** as Administrator (required to test system file cleaning):

```powershell
npx tauri dev
```

The app will open. Vite hot-reloads the frontend instantly; Rust changes trigger a recompile (~10–40s).

### Production build (MSI installer)

From **Developer PowerShell for VS** as Administrator:

```powershell
npx tauri build
```

Output: `src-tauri/target/release/bundle/msi/MACMCleaner_1.0.0_x64_en-US.msi`

The build process:
1. Compiles the Vite frontend (optimized, ~430 KB JS)
2. Compiles Rust in release mode (LTO, size-optimized)
3. Bundles everything into a signed MSI via WiX Toolset

---

## Project structure

```
macmcleaner/
├── src/                        # React frontend (TypeScript)
│   ├── components/
│   │   ├── layout/             # TitleBar, Sidebar, Layout
│   │   └── ui/                 # Button, Card, Badge, Modal, ProgressBar, etc.
│   ├── hooks/                  # useTauri (Tauri IPC bridge)
│   ├── locales/                # i18n — es.json, en.json
│   ├── pages/                  # Dashboard, Results, Settings, About
│   ├── store/                  # Zustand global state
│   └── utils/                  # formatBytes, formatDate
│
├── src-tauri/                  # Rust backend (Tauri v2)
│   ├── src/
│   │   ├── main.rs             # Entry point
│   │   ├── lib.rs              # Tauri commands (load_config, save_config, start_scan, clean_files…)
│   │   ├── safety/             # Path validation — blacklist + whitelist + double-check
│   │   ├── scanner/            # File discovery with real-time progress events
│   │   └── cleaner/            # temp.rs, browser.rs, system.rs, recycle.rs
│   ├── capabilities/           # Tauri v2 permission system
│   ├── macmcleaner.manifest    # Windows app manifest (requestAdministrator)
│   ├── build.rs                # Embeds manifest via tauri-build
│   └── tauri.conf.json         # App config, window, bundle, MSI settings
│
├── public/                     # Static assets (logo)
├── tailwind.config.js          # Design tokens — colors, shadows, animations
└── LICENSE                     # GNU General Public License v3
```

---

## Safety system

MACMCleaner includes a multi-layer safety system to make sure no critical files are ever touched.

### Blacklisted paths (never touched)
`C:\Windows\System32`, `C:\Windows\SysWOW64`, `C:\Windows\WinSxS`, `C:\Windows\Boot`, `C:\Program Files`, `C:\Program Files (x86)`, user Documents, Desktop, Downloads, Pictures, Videos, Music, OneDrive, and more.

### Whitelisted paths (explicitly allowed)
`C:\Windows\Temp`, `C:\Windows\Prefetch`, `C:\Windows\Logs`, `%LOCALAPPDATA%\Temp`, browser cache subfolders (Cache_Data, cache2), and Explorer thumbnail cache.

### Double validation
Every file path is validated **twice** — once during scan and once immediately before deletion. Even if a bug or edge case allowed a bad path to appear in the UI, the delete operation will reject it.

### Browser safety
The browser cleaner targets only cache directories (`Cache_Data`, `cache2`) and explicitly blocks: `Bookmarks`, `Cookies`, `History`, `Login Data`, `Web Data`, `Preferences`, `Favicons`, `Shortcuts`, `Top Sites`, `Visited Links`.

### Blacklisted filenames
Regardless of location, these are never deleted: `ntoskrnl.exe`, `hal.dll`, `bootmgr`, `ntldr`, `boot.ini`, `pagefile.sys`, `hiberfil.sys`, `swapfile.sys`, `ntuser.dat`, `usrclass.dat`, registry hive files.

---

## Configuration

App settings are stored in the standard user config directory:

```
C:\Users\<user>\AppData\Roaming\es.miguelacm.macmcleaner\config.json
```

```json
{
  "language": "es",
  "terms_accepted": true,
  "first_launch": false,
  "exclusions": [],
  "last_scan_date": "2026-03-26T12:00:00+01:00",
  "total_cleaned": 1073741824,
  "scans_performed": 5
}
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Tauri v2](https://tauri.app) |
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v3 + Framer Motion |
| State | Zustand |
| i18n | i18next (ES / EN) |
| Backend | Rust (stable) |
| File walking | walkdir |
| Date/time | chrono |
| Installer | WiX Toolset (MSI) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Bug reports and feature requests → [GitHub Issues](https://github.com/miguelacm/macmcleaner/issues)

---

## License

**MACMCleaner** is free software released under the **GNU General Public License v3.0**.

You may copy, distribute and modify it under the terms of the GPL v3, as long as you publish any changes under the same license.

See [LICENSE](LICENSE) for the full text.

---

## Author

**Miguel Ángel Colorado Marin** · [miguelacm.es](https://miguelacm.es)

> *"Clean what's yours. Own what you run."*
