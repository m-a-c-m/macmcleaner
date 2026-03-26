mod scanner;
mod cleaner;
mod safety;

use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};

// ─── App State ───────────────────────────────────────────────────────────────

struct AppState {
    cancel_flag: Arc<AtomicBool>,
}

// ─── Config types ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub language: String,
    pub terms_accepted: bool,
    pub first_launch: bool,
    pub exclusions: Vec<String>,
    pub last_scan_date: Option<String>,
    pub total_cleaned: u64,
    pub scans_performed: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            language: "es".into(),
            terms_accepted: false,
            first_launch: true,
            exclusions: vec![],
            last_scan_date: None,
            total_cleaned: 0,
            scans_performed: 0,
        }
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

// ─── Commands ─────────────────────────────────────────────────────────────────

#[tauri::command]
fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    let path = config_path(&app)?;
    if path.exists() {
        let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| e.to_string())
    } else {
        Ok(AppConfig::default())
    }
}

#[tauri::command]
fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let path = config_path(&app)?;
    let data = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    std::fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
async fn start_scan(
    app: AppHandle,
    state: State<'_, AppState>,
    categories: Vec<String>,
    exclusions: Vec<String>,
) -> Result<scanner::ScanResult, String> {
    state.cancel_flag.store(false, Ordering::SeqCst);
    let cancel = state.cancel_flag.clone();
    let excl: Vec<PathBuf> = exclusions.into_iter().map(PathBuf::from).collect();

    tauri::async_runtime::spawn_blocking(move || {
        scanner::run_scan(&app, &categories, &excl, &cancel)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
fn cancel_scan(state: State<'_, AppState>) {
    state.cancel_flag.store(true, Ordering::SeqCst);
}

#[tauri::command]
async fn clean_files(
    app: AppHandle,
    file_paths: Vec<String>,
    exclusions: Vec<String>,
) -> Result<cleaner::CleanResult, String> {
    let excl: Vec<PathBuf> = exclusions.into_iter().map(PathBuf::from).collect();
    let app_clone = app.clone();

    let result = tauri::async_runtime::spawn_blocking(move || {
        let (regular, has_recycle) = {
            let mut r = vec![];
            let mut rec = false;
            for p in &file_paths {
                if p == "__RECYCLE_BIN__" { rec = true; } else { r.push(p.clone()); }
            }
            (r, rec)
        };

        let mut result = cleaner::delete_files(&regular, &excl);

        if has_recycle {
            let bin_size = cleaner::recycle::get_recycle_bin_size();
            match cleaner::recycle::empty_recycle_bin() {
                Ok(_) => {
                    result.deleted_files += 1;
                    result.freed_space += bin_size;
                }
                Err(e) => result.errors.push(format!("Recycle Bin: {}", e)),
            }
        }

        // Emit progress
        let _ = app_clone.emit("clean-progress", serde_json::json!({
            "deleted": result.deleted_files,
            "freed": result.freed_space,
            "total": result.deleted_files + result.errors.len(),
        }));

        result
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(result)
}

// ─── Entry point ──────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .manage(AppState {
            cancel_flag: Arc::new(AtomicBool::new(false)),
        })
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            start_scan,
            cancel_scan,
            clean_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running MACMCleaner");
}
