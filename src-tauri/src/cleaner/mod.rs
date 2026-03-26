pub mod temp;
pub mod browser;
pub mod system;
pub mod recycle;

use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::safety;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanResult {
    pub deleted_files: usize,
    pub freed_space: u64,
    pub errors: Vec<String>,
}

/// Returns the directories to scan for a given category ID.
pub fn get_scan_paths(cat_id: &str) -> Vec<PathBuf> {
    match cat_id {
        "temp"    => temp::scan_paths(),
        "browser" => browser::scan_paths(),
        "system"  => system::scan_paths(),
        _         => vec![],
    }
}

/// Delete a list of file paths, with double safety validation before each deletion.
pub fn delete_files(
    file_paths: &[String],
    exclusions: &[PathBuf],
) -> CleanResult {
    let mut deleted = 0usize;
    let mut freed   = 0u64;
    let mut errors  = Vec::new();

    for path_str in file_paths {
        if path_str == "__RECYCLE_BIN__" { continue; } // handled separately

        let path = PathBuf::from(path_str);

        // Double safety check
        if let Err(reason) = safety::validate_path(&path, exclusions) {
            errors.push(format!("BLOCKED: {} — {}", path_str, reason));
            continue;
        }

        match std::fs::metadata(&path) {
            Ok(meta) => {
                let size = meta.len();
                if meta.is_dir() {
                    match std::fs::remove_dir_all(&path) {
                        Ok(_)  => { deleted += 1; freed += size; }
                        Err(e) => { errors.push(format!("{}: {}", path_str, e)); }
                    }
                } else {
                    match std::fs::remove_file(&path) {
                        Ok(_)  => { deleted += 1; freed += size; }
                        Err(e) => {
                            // File may be locked — skip silently (common for temp files in use)
                            errors.push(format!("{}: {}", path_str, e));
                        }
                    }
                }
            }
            Err(_) => {} // File already gone — count as success
        }
    }

    CleanResult { deleted_files: deleted, freed_space: freed, errors }
}
