use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager}; 

fn get_wallet_path(app_handle: &AppHandle) -> PathBuf {
    let mut config_dir = app_handle.path().app_config_dir().expect("Could not resolve config dir");
    
    if !config_dir.exists() {
        let _ = fs::create_dir_all(&config_dir);
    }

    config_dir.push("wallet_keystore.json");
    config_dir
}

fn get_address_path(app_handle: &AppHandle) -> PathBuf {
    let mut config_dir = app_handle.path().app_config_dir().expect("Could not resolve config dir");
    
    if !config_dir.exists() {
        let _ = fs::create_dir_all(&config_dir);
    }

    config_dir.push("wallet_address.txt");
    config_dir
}

#[tauri::command]
fn save_wallet_file(app_handle: AppHandle, data: String, address: String) -> Result<String, String> {
    let keystore_path = get_wallet_path(&app_handle);
    let address_path = get_address_path(&app_handle);
    
    // Save encrypted keystore
    fs::write(&keystore_path, data).map_err(|e| e.to_string())?;
    
    // Save public address as plaintext (for recovery verification)
    fs::write(&address_path, address).map_err(|e| e.to_string())?;
    
    Ok("Saved successfully".to_string())
}

#[tauri::command]
fn read_wallet_file(app_handle: AppHandle) -> Result<String, String> {
    let path = get_wallet_path(&app_handle);

    if !path.exists() {
        return Err("No wallet file found.".to_string());
    }

    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_wallet_address(app_handle: AppHandle) -> Result<String, String> {
    let path = get_address_path(&app_handle);

    if !path.exists() {
        return Err("No wallet address file found.".to_string());
    }

    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn wallet_exists(app_handle: AppHandle) -> bool {
    let path = get_wallet_path(&app_handle);
    path.exists()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_wallet_file, 
            read_wallet_file,
            read_wallet_address,
            wallet_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
