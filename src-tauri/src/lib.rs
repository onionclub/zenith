use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[tauri::command]
fn save_image(app_handle: tauri::AppHandle, file_name: String, data: Vec<u8>) -> Result<String, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let assets_dir: PathBuf = app_dir.join(".zenith_assets");
    fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;

    let file_path = assets_dir.join(&file_name);
    fs::write(&file_path, &data).map_err(|e| e.to_string())?;

    file_path
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to convert path to string".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![save_image])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
