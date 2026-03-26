use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;
use tauri::{AppHandle, Emitter};
use crate::safety;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScannedFile {
    pub path: String,
    pub size: u64,
    pub modified: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanCategory {
    pub id: String,
    pub files: Vec<ScannedFile>,
    pub total_size: u64,
    pub file_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub categories: Vec<ScanCategory>,
    pub total_files: usize,
    pub total_size: u64,
    pub scan_date: String,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub category: String,
    pub files_found: usize,
    pub current_path: String,
    pub progress_percent: f64,
}

pub fn run_scan(
    app: &AppHandle,
    categories: &[String],
    exclusions: &[PathBuf],
    cancel: &Arc<AtomicBool>,
) -> Result<ScanResult, String> {
    let start = std::time::Instant::now();
    let now = chrono::Local::now().to_rfc3339();
    let total = categories.len() as f64;
    let mut result_cats: Vec<ScanCategory> = Vec::new();

    for (idx, cat_id) in categories.iter().enumerate() {
        if cancel.load(Ordering::SeqCst) {
            return Err("Scan cancelled".into());
        }

        let base_progress = idx as f64 / total * 100.0;
        let _ = app.emit("scan-progress", ScanProgress {
            category: cat_id.clone(),
            files_found: 0,
            current_path: String::new(),
            progress_percent: base_progress,
        });

        let cat = match cat_id.as_str() {
            "recycle" => scan_recycle_bin(cat_id),
            _ => {
                let paths = crate::cleaner::get_scan_paths(cat_id);
                scan_paths(app, cat_id, &paths, exclusions, cancel, base_progress, total)
            }
        };

        result_cats.push(cat);
    }

    let total_files: usize = result_cats.iter().map(|c| c.file_count).sum();
    let total_size: u64 = result_cats.iter().map(|c| c.total_size).sum();

    Ok(ScanResult {
        categories: result_cats,
        total_files,
        total_size,
        scan_date: now,
        scan_duration_ms: start.elapsed().as_millis() as u64,
    })
}

fn scan_paths(
    app: &AppHandle,
    cat_id: &str,
    paths: &[PathBuf],
    exclusions: &[PathBuf],
    cancel: &Arc<AtomicBool>,
    base_progress: f64,
    total_cats: f64,
) -> ScanCategory {
    let mut files: Vec<ScannedFile> = Vec::new();
    let mut total_size = 0u64;
    // For temp: enumerate depth-1 items (files + subdirs) so whole folders are cleanable.
    // For other categories: recurse into all files only.
    let is_temp = cat_id == "temp";

    for scan_path in paths {
        if !scan_path.exists() { continue; }
        if cancel.load(Ordering::SeqCst) { break; }

        let walker = if is_temp {
            WalkDir::new(scan_path).follow_links(false).max_depth(1)
        } else {
            WalkDir::new(scan_path).follow_links(false)
        };

        for entry in walker.into_iter().filter_map(|e| e.ok()) {
            if cancel.load(Ordering::SeqCst) { break; }

            let path = entry.path();

            if is_temp {
                if entry.depth() == 0 { continue; } // skip the root temp dir itself
                // include both files and subdirs at depth 1
            } else {
                if !path.is_file() { continue; }
            }

            // Apply category-specific filters
            if !passes_filter(cat_id, path) { continue; }

            // Safety validation (double check)
            if safety::validate_path(path, exclusions).is_err() { continue; }

            let Ok(meta) = entry.metadata() else { continue };
            let size = if path.is_dir() {
                dir_total_size(path)
            } else {
                meta.len()
            };
            let modified = meta.modified()
                .ok()
                .map(|t| chrono::DateTime::<chrono::Local>::from(t).to_rfc3339())
                .unwrap_or_default();

            let _ = app.emit("scan-progress", ScanProgress {
                category: cat_id.to_string(),
                files_found: files.len() + 1,
                current_path: path.to_string_lossy().to_string(),
                progress_percent: base_progress + (1.0 / total_cats * 80.0),
            });

            files.push(ScannedFile {
                path: path.to_string_lossy().to_string(),
                size,
                modified,
                category: cat_id.to_string(),
            });
            total_size += size;

            // Throttle: yield every 50 items to avoid pegging CPU
            if files.len() % 50 == 0 {
                std::thread::sleep(std::time::Duration::from_millis(1));
            }
        }
    }

    let file_count = files.len();
    ScanCategory { id: cat_id.to_string(), files, total_size, file_count }
}

fn dir_total_size(path: &Path) -> u64 {
    WalkDir::new(path)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
        .filter_map(|e| e.metadata().ok())
        .map(|m| m.len())
        .sum()
}

fn scan_recycle_bin(cat_id: &str) -> ScanCategory {
    let size = crate::cleaner::recycle::get_recycle_bin_size();
    let count = crate::cleaner::recycle::get_recycle_bin_count();

    if count == 0 {
        return ScanCategory { id: cat_id.to_string(), files: vec![], total_size: 0, file_count: 0 };
    }

    let files = vec![ScannedFile {
        path: "__RECYCLE_BIN__".to_string(),
        size,
        modified: chrono::Local::now().to_rfc3339(),
        category: cat_id.to_string(),
    }];

    ScanCategory { id: cat_id.to_string(), files, total_size: size, file_count: count }
}

/// Category-specific file filters.
fn passes_filter(cat_id: &str, path: &Path) -> bool {
    let fname = path.file_name()
        .map(|f| f.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let ext = path.extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    match cat_id {
        "system" => {
            // Prefetch: .pf files only
            // Logs: .log and .etl files
            // Explorer thumbnails: thumbcache_*.db
            ext == "pf" || ext == "log" || ext == "etl"
                || (fname.starts_with("thumbcache_") && ext == "db")
                || fname == "thumbs.db"
        }
        "browser" => {
            // Don't include SQLite databases with user data (history, passwords, etc.)
            let blocked_names = ["bookmarks", "cookies", "history", "login data",
                "web data", "preferences", "favicons", "shortcuts", "top sites",
                "visited links", "network action predictor"];
            !blocked_names.contains(&fname.as_str())
        }
        _ => true, // temp: all files
    }
}
