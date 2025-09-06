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
    let resource_dir = match app_handle.path().resource_dir() {
      Ok(dir) => dir,
      Err(e) => {
        eprintln!("Failed to get resource dir: {}", e);
        return;
      }
    };
    
    let backend_dir = resource_dir.join("backend");
    
    // Proveri da li backend folder postoji
    if !backend_dir.exists() {
      eprintln!("Backend directory does not exist: {:?}", backend_dir);
      return;
    }
    
    // Proveri da li server.js postoji
    let server_js = backend_dir.join("server.js");
    if !server_js.exists() {
      eprintln!("server.js does not exist in: {:?}", backend_dir);
      return;
    }
    
    // Pokušaj da pokreneš Node.js server sa različitim putanjama
    let local_node = backend_dir.join("node");
    let node_paths = vec![
      local_node.to_string_lossy().to_string(),
      "node".to_string(),
      "/usr/local/bin/node".to_string(),
      "/opt/homebrew/bin/node".to_string(),
      "/usr/bin/node".to_string(),
    ];
    
    let mut child = None;
    for node_path in node_paths {
      match Command::new(&node_path)
        .arg("server.js")
        .current_dir(&backend_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
      {
        Ok(c) => {
          println!("Backend server started with node at: {}", node_path);
          child = Some(c);
          break;
        }
        Err(e) => {
          eprintln!("Failed to start with {}: {}", node_path, e);
        }
      }
    }
    
    match child {
      Some(mut child) => {
        // Čekaj da se server pokrene
        thread::sleep(Duration::from_secs(3));
        
        // Proveri da li je proces još uvek aktivan
        match child.try_wait() {
          Ok(Some(status)) => {
            eprintln!("Backend server exited with status: {:?}", status);
          }
          Ok(None) => {
            println!("Backend server is running successfully");
          }
          Err(e) => {
            eprintln!("Error checking backend server status: {}", e);
          }
        }
        
        // Čekaj da se proces završi (ili aplikacija zatovori)
        let _ = child.wait();
      }
      None => {
        eprintln!("Failed to start backend server with any node path");
      }
    }
  });
}
