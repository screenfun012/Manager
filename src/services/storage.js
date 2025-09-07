// Storage utility za Tauri aplikaciju
// Koristi localStorage ako je dostupan, inače sessionStorage ili memory storage

class StorageService {
  constructor() {
    this.memoryStorage = new Map();
    this.isLocalStorageAvailable = this.checkLocalStorage();
  }

  checkLocalStorage() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage nije dostupan, koristim sessionStorage');
      return false;
    }
  }

  setItem(key, value) {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Greška pri čuvanju u storage, koristim memory storage:', error);
      this.memoryStorage.set(key, value);
    }
  }

  getItem(key) {
    try {
      if (this.isLocalStorageAvailable) {
        return localStorage.getItem(key);
      } else {
        return sessionStorage.getItem(key);
      }
    } catch (error) {
      console.warn('Greška pri čitanju iz storage, koristim memory storage:', error);
      return this.memoryStorage.get(key);
    }
  }

  removeItem(key) {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      } else {
        sessionStorage.removeItem(key);
      }
      this.memoryStorage.delete(key);
    } catch (error) {
      console.warn('Greška pri brisanju iz storage:', error);
      this.memoryStorage.delete(key);
    }
  }

  clear() {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.clear();
      } else {
        sessionStorage.clear();
      }
      this.memoryStorage.clear();
    } catch (error) {
      console.warn('Greška pri čišćenju storage:', error);
      this.memoryStorage.clear();
    }
  }
}

// Kreiraj globalnu instancu
const storage = new StorageService();

export default storage;
