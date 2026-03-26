use std::path::PathBuf;

pub fn scan_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(temp) = std::env::var("TEMP") {
        paths.push(PathBuf::from(temp));
    }
    if let Ok(tmp) = std::env::var("TMP") {
        let p = PathBuf::from(tmp);
        if !paths.contains(&p) { paths.push(p); }
    }
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        let p = PathBuf::from(format!("{}\\Temp", local));
        if !paths.contains(&p) { paths.push(p); }
    }

    let sys = std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into());
    paths.push(PathBuf::from(format!("{}\\Temp", sys)));

    paths
}
