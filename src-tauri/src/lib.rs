use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Pokreni Node.js backend server u pozadini
      start_backend_server(app);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn start_backend_server(app: &mut tauri::App) {
  let app_handle = app.handle().clone();
  
  thread::spawn(move || {
    // Čekaj malo da se aplikacija pokrene
    thread::sleep(Duration::from_secs(1));
    
    // Pronađi putanju do backend foldera
    let resource_dir = app_handle
      .path()
      .resource_dir()
      .expect("failed to get resource dir");
    
    let backend_dir = resource_dir.join("backend");
    
    // Pokreni Node.js server
    let mut child = Command::new("node")
      .arg("server.js")
      .current_dir(backend_dir)
      .stdout(Stdio::null())
      .stderr(Stdio::null())
      .spawn()
      .expect("Failed to start backend server");
    
    // Čekaj da se server pokrene
    thread::sleep(Duration::from_secs(2));
    
    println!("Backend server started successfully");
    
    // Čekaj da se proces završi (ili aplikacija zatovori)
    let _ = child.wait();
  });
}
