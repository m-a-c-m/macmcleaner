use std::path::{Path, PathBuf};

/// Returns absolute path prefixes that must NEVER be scanned or deleted.
/// These are checked case-insensitively on Windows.
pub fn blacklisted_prefixes() -> Vec<PathBuf> {
    let sys = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into());
    let pf  = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".into());
    let pf86 = std::env::var("ProgramFiles(x86)").unwrap_or_else(|_| "C:\\Program Files (x86)".into());
    let up  = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".into());

    vec![
        // Critical Windows internals
        PathBuf::from(format!("{}\\System32", sys)),
        PathBuf::from(format!("{}\\SysWOW64", sys)),
        PathBuf::from(format!("{}\\WinSxS", sys)),
        PathBuf::from(format!("{}\\Boot", sys)),
        PathBuf::from(format!("{}\\Fonts", sys)),
        PathBuf::from(format!("{}\\servicing", sys)),
        PathBuf::from(format!("{}\\INF", sys)),
        PathBuf::from(format!("{}\\security", sys)),
        PathBuf::from(format!("{}\\System32\\config", sys)),
        PathBuf::from(format!("{}\\System32\\drivers", sys)),

        // Installed programs
        PathBuf::from(&pf),
        PathBuf::from(&pf86),

        // User data (never touch personal files)
        PathBuf::from(format!("{}\\Documents", up)),
        PathBuf::from(format!("{}\\Desktop", up)),
        PathBuf::from(format!("{}\\Downloads", up)),
        PathBuf::from(format!("{}\\Pictures", up)),
        PathBuf::from(format!("{}\\Videos", up)),
        PathBuf::from(format!("{}\\Music", up)),
        PathBuf::from(format!("{}\\OneDrive", up)),
        PathBuf::from(format!("{}\\Saved Games", up)),
        PathBuf::from(format!("{}\\Contacts", up)),
        PathBuf::from(format!("{}\\Favorites", up)),
        PathBuf::from(format!("{}\\Links", up)),

        // Boot & recovery
        PathBuf::from("C:\\Boot"),
        PathBuf::from("C:\\Recovery"),
        PathBuf::from("C:\\EFI"),
    ]
}

/// Explicit paths that ARE allowed to be cleaned (override blacklist for Windows dir).
pub fn allowed_prefixes() -> Vec<PathBuf> {
    let sys = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into());
    let local = std::env::var("LOCALAPPDATA").unwrap_or_default();

    let mut v = vec![
        PathBuf::from(format!("{}\\Temp", sys)),
        PathBuf::from(format!("{}\\Prefetch", sys)),
        PathBuf::from(format!("{}\\SoftwareDistribution\\Download", sys)),
        PathBuf::from(format!("{}\\Logs", sys)),
    ];

    if !local.is_empty() {
        v.push(PathBuf::from(format!("{}\\Temp", local)));
        // Browser caches (specific subdirs only)
        v.push(PathBuf::from(format!("{}\\Google\\Chrome\\User Data", local)));
        v.push(PathBuf::from(format!("{}\\Microsoft\\Edge\\User Data", local)));
        v.push(PathBuf::from(format!("{}\\BraveSoftware\\Brave-Browser\\User Data", local)));
        v.push(PathBuf::from(format!("{}\\Mozilla\\Firefox\\Profiles", local)));
        // Thumbnails
        v.push(PathBuf::from(format!("{}\\Microsoft\\Windows\\Explorer", local)));
    }

    if let Ok(tmp) = std::env::var("TEMP") { v.push(PathBuf::from(tmp)); }
    if let Ok(tmp) = std::env::var("TMP")  { v.push(PathBuf::from(tmp)); }

    v
}

/// Filenames that must NEVER be deleted regardless of location.
pub fn blacklisted_filenames() -> &'static [&'static str] {
    &[
        "ntoskrnl.exe", "hal.dll", "bootmgr", "ntldr", "boot.ini",
        "pagefile.sys", "hiberfil.sys", "swapfile.sys",
        "ntuser.dat", "usrclass.dat",
        "system", "sam", "security", "software", "default",
    ]
}

/// Validate a path before scan or delete.
/// Returns Ok(()) if safe, Err(reason) if blocked.
pub fn validate_path(path: &Path, exclusions: &[PathBuf]) -> Result<(), String> {
    let path_lc = path.to_string_lossy().to_lowercase();

    // 1. User exclusions (highest priority)
    for excl in exclusions {
        let excl_lc = excl.to_string_lossy().to_lowercase();
        if path_lc.starts_with(&excl_lc) {
            return Err(format!("Excluded by user: {}", path.display()));
        }
    }

    // 2. Allowed paths override blacklist (e.g., C:\Windows\Temp is allowed even though C:\Windows is not)
    for allowed in allowed_prefixes() {
        let allowed_lc = allowed.to_string_lossy().to_lowercase();
        if path_lc.starts_with(&allowed_lc) {
            // Still check for blacklisted filenames
            if let Some(fname) = path.file_name() {
                let fname_lc = fname.to_string_lossy().to_lowercase();
                for blocked in blacklisted_filenames() {
                    if fname_lc == *blocked {
                        return Err(format!("Critical file: {}", path.display()));
                    }
                }
            }
            return Ok(());
        }
    }

    // 3. Check blacklisted prefixes
    for blocked in blacklisted_prefixes() {
        let blocked_lc = blocked.to_string_lossy().to_lowercase();
        if path_lc.starts_with(&blocked_lc) {
            return Err(format!("Blacklisted directory: {}", path.display()));
        }
    }

    // 4. Check blacklisted filenames
    if let Some(fname) = path.file_name() {
        let fname_lc = fname.to_string_lossy().to_lowercase();
        for blocked in blacklisted_filenames() {
            if fname_lc == *blocked {
                return Err(format!("Critical file: {}", path.display()));
            }
        }
    }

    Ok(())
}
