use std::path::PathBuf;

pub fn scan_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    let local = match std::env::var("LOCALAPPDATA") {
        Ok(v) => v,
        Err(_) => return paths,
    };

    // Chromium-based browsers
    let chromium_bases = [
        format!("{}\\Google\\Chrome\\User Data", local),
        format!("{}\\Microsoft\\Edge\\User Data", local),
        format!("{}\\BraveSoftware\\Brave-Browser\\User Data", local),
        format!("{}\\Opera Software\\Opera Stable", local),
        format!("{}\\Vivaldi\\User Data", local),
    ];

    for base in &chromium_bases {
        let base_path = PathBuf::from(base);
        if !base_path.exists() { continue; }
        collect_chromium_caches(&base_path, &mut paths);
    }

    // Firefox
    let ff_profiles = PathBuf::from(format!("{}\\Mozilla\\Firefox\\Profiles", local));
    if ff_profiles.exists() {
        if let Ok(entries) = std::fs::read_dir(&ff_profiles) {
            for entry in entries.flatten() {
                let cache2 = entry.path().join("cache2");
                if cache2.exists() { paths.push(cache2); }
                let thumbnails = entry.path().join("thumbnails");
                if thumbnails.exists() { paths.push(thumbnails); }
            }
        }
    }

    paths
}

fn collect_chromium_caches(user_data: &PathBuf, out: &mut Vec<PathBuf>) {
    let profile_dirs = ["Default", "Profile 1", "Profile 2", "Profile 3",
        "Profile 4", "Profile 5", "Guest Profile"];

    for profile in &profile_dirs {
        let base = user_data.join(profile);
        if !base.exists() { continue; }

        let cache_data = base.join("Cache").join("Cache_Data");
        if cache_data.exists() { out.push(cache_data); }

        let code_cache = base.join("Code Cache");
        if code_cache.exists() { out.push(code_cache); }

        let gpu_cache = base.join("GPUCache");
        if gpu_cache.exists() { out.push(gpu_cache); }
    }
}
