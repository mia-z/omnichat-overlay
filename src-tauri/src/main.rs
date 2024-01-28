// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, AppHandle};

fn main() {
    // let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    // let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    // let show = CustomMenuItem::new("show".to_string(), "Show");
    // let tray_menu = SystemTrayMenu::new()
    //     .add_item(quit)
    //     .add_native_item(SystemTrayMenuItem::Separator)
    //     .add_item(hide)
    //     .add_item(show);

    // let system_tray = SystemTray::new()
    //     .with_menu(tray_menu);
    
    // fn handle_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    //     match event {
    //         SystemTrayEvent::MenuItemClick { id, .. } => {
    //             match id.as_str() {
    //                 "quit" => {
    //                     std::process::exit(0);
    //                 }
    //                 "hide" => {
    //                     let window = app.get_window("main").unwrap();
    //                     window.hide().unwrap();
    //                 }
    //                 "show" => {
    //                     let window = app.get_window("main").unwrap();
    //                     window.show().unwrap();
    //                 }
    //             _ => {}
    //             }
    //         }
    //         _ => {}
    //     }
    // }
    
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        //.system_tray(system_tray)
        //.on_system_tray_event(handle_tray_event)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
