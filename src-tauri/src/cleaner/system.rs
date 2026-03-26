use std::path::PathBuf;

pub fn scan_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    let sys = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into());

    // Windows Prefetch (.pf files)
    paths.push(PathBuf::from(format!("{}\\Prefetch", sys)));

    // Windows Update cache
    paths.push(PathBuf::from(format!("{}\\SoftwareDistribution\\Download", sys)));

    // Windows log files
    paths.push(PathBuf::from(format!("{}\\Logs", sys)));

    // Thumbnail cache
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        paths.push(PathBuf::from(format!("{}\\Microsoft\\Windows\\Explorer", local)));
    }

    paths
}
