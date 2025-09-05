// Utility funkcije za Save As dialog i file operacije

// Kreiraj default filename na osnovu trenutnog perioda
export const generateDefaultFilename = (period, format = 'xlsx') => {
  const date = new Date();
  const timestamp = date.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '');
  const periodStr = period ? period.label.replace(/\s+/g, '_') : 'Izdavanja';
  
  return `${periodStr}_${timestamp}.${format}`;
};

// Otvori Save As dialog (Tauri API ili fallback)
export const openSaveAsDialog = async (defaultFilename, filters = []) => {
  try {
    // Proveri da li je Tauri dostupan
    if (window.__TAURI__) {
      const { save } = await import('@tauri-apps/api/dialog');
      
      const filePath = await save({
        defaultPath: defaultFilename,
        filters: filters.length > 0 ? filters : [
          {
            name: 'Excel Files',
            extensions: ['xlsx', 'xls']
          },
          {
            name: 'Word Documents',
            extensions: ['docx', 'doc']
          },
          {
            name: 'CSV Files',
            extensions: ['csv']
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ]
      });
      
      return filePath;
    } else {
      // Fallback za web verziju - koristi default filename
      return defaultFilename;
    }
  } catch (error) {
    console.error('Greška pri otvaranju Save As dialog-a:', error);
    // Fallback na default filename
    return defaultFilename;
  }
};

// Sačuvaj fajl na odabranu lokaciju
export const saveFileToPath = async (filePath, data, format) => {
  try {
    if (window.__TAURI__) {
      // Tauri verzija
      if (format === 'xlsx' || format === 'csv') {
        const { writeBinaryFile } = await import('@tauri-apps/api/fs');
        await writeBinaryFile(filePath, data);
      } else if (format === 'docx') {
        const { writeBinaryFile } = await import('@tauri-apps/api/fs');
        await writeBinaryFile(filePath, data);
      } else {
        throw new Error(`Nepodržan format fajla: ${format}`);
      }
    } else {
      // Web verzija - koristi download
      const blob = new Blob([data], { 
        type: format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              'application/octet-stream'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    return true;
  } catch (error) {
    console.error('Greška pri čuvanju fajla:', error);
    throw new Error(`Greška pri čuvanju fajla: ${error.message}`);
  }
};

// Kombinovana funkcija za Save As workflow
export const saveAsWorkflow = async (data, period, format = 'xlsx', filters = []) => {
  try {
    console.log('saveAsWorkflow called with:', { 
      dataSize: data?.length || 0, 
      period: period?.label, 
      format, 
      tauriAvailable: !!window.__TAURI__ 
    });
    
    // Generiši default filename
    const defaultFilename = generateDefaultFilename(period, format);
    console.log('Generated filename:', defaultFilename);
    
    // Uvek koristi fallback verziju za sada
    console.log('Using fallback download method');
    
    // Fallback verzija - direktno download
    const blob = new Blob([data], { 
      type: format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
            format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
            'application/octet-stream'
    });
    
    console.log('Blob created, size:', blob.size);
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download triggered successfully');
    
    return {
      success: true,
      filePath: defaultFilename,
      message: `Fajl je uspešno preuzet: ${defaultFilename}`
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message,
      message: `Greška pri export-u: ${error.message}`
    };
  }
};

// Otvori fajl u default aplikaciji
export const openFileInDefaultApp = async (filePath) => {
  try {
    if (window.__TAURI__) {
      const { open } = await import('@tauri-apps/api/shell');
      await open(filePath);
      return true;
    } else {
      // Web verzija - ne može da otvori fajl
      console.log('Otvaranje fajla nije podržano u web verziji');
      return false;
    }
  } catch (error) {
    console.error('Greška pri otvaranju fajla:', error);
    return false;
  }
};

// Prikaži toast notifikaciju
export const showToast = (message, type = 'info') => {
  // Kreiraj toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    word-wrap: break-word;
  `;
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Ukloni toast nakon 5 sekundi
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
};
