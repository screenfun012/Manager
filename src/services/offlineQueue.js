// Offline Queue Service
class OfflineQueueService {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.storageKey = 'offlineQueue';
    this.maxRetries = 3;
    
    this.init();
  }

  // Inicijalizacija servisa
  init() {
    this.loadQueue();
    this.setupEventListeners();
    this.processQueueIfOnline();
  }

  // Event listeneri za online/offline status
  setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Online - procesiram offline queue');
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Offline - čuvam operacije u queue');
      this.isOnline = false;
    });
  }

  // Dodavanje operacije u offline queue
  addToQueue(operation) {
    const queueItem = {
      id: this.generateId(),
      operation: operation.type,
      data: operation.data,
      url: operation.url,
      method: operation.method,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    this.queue.push(queueItem);
    this.saveQueue();
    
    console.log('📝 Dodato u offline queue:', queueItem);
    
    // Ako je online, pokušaj da procesiraš odmah
    if (this.isOnline) {
      this.processQueue();
    }
    
    return queueItem.id;
  }

  // Procesiranje offline queue-a
  async processQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    console.log('🔄 Procesiram offline queue...');
    
    const itemsToProcess = [...this.queue];
    
    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item);
        this.removeFromQueue(item.id);
        console.log('✅ Offline item obrađen:', item.id);
      } catch (error) {
        console.error('❌ Greška pri obradi offline item-a:', item.id, error);
        
        // Povećaj broj pokušaja
        item.retries++;
        
        if (item.retries >= this.maxRetries) {
          item.status = 'failed';
          console.log('💀 Item neuspešan nakon maksimalnih pokušaja:', item.id);
        }
        
        this.updateQueueItem(item);
      }
    }
  }

  // Obrada pojedinačnog queue item-a
  async processQueueItem(item) {
    const { url, method, data } = item;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  // Uklanjanje item-a iz queue-a
  removeFromQueue(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  // Ažuriranje queue item-a
  updateQueueItem(updatedItem) {
    this.queue = this.queue.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    this.saveQueue();
  }

  // Učitavanje queue-a iz localStorage
  loadQueue() {
    try {
      const savedQueue = localStorage.getItem(this.storageKey);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        console.log('📦 Offline queue učitana:', this.queue.length, 'items');
      }
    } catch (error) {
      console.error('❌ Greška pri učitavanju offline queue-a:', error);
      this.queue = [];
    }
  }

  // Čuvanje queue-a u localStorage
  saveQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('❌ Greška pri čuvanju offline queue-a:', error);
    }
  }

  // Generisanje jedinstvenog ID-a
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Provera da li je online
  checkOnlineStatus() {
    return navigator.onLine;
  }

  // Dohvatanje queue-a
  getQueue() {
    return [...this.queue];
  }

  // Dohvatanje queue-a po statusu
  getQueueByStatus(status) {
    return this.queue.filter(item => item.status === status);
  }

  // Brisanje celog queue-a
  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.log('🗑️ Offline queue obrisana');
  }

  // Statistike queue-a
  getQueueStats() {
    const total = this.queue.length;
    const pending = this.queue.filter(item => item.status === 'pending').length;
    const failed = this.queue.filter(item => item.status === 'failed').length;
    const processing = this.queue.filter(item => item.status === 'processing').length;

    return {
      total,
      pending,
      failed,
      processing
    };
  }

  // Procesiranje queue-a ako je online
  processQueueIfOnline() {
    if (this.isOnline && this.queue.length > 0) {
      setTimeout(() => {
        this.processQueue();
      }, 1000); // Sačekaj 1 sekund
    }
  }
}

// Factory funkcija za kreiranje offline queue operacija
export const createOfflineOperation = (type, data, url, method = 'POST') => {
  return {
    type,
    data,
    url,
    method
  };
};

// Predefinisane operacije
export const OfflineOperations = {
  ADD_MATERIAL: 'ADD_MATERIAL',
  UPDATE_MATERIAL: 'UPDATE_MATERIAL',
  DELETE_MATERIAL: 'DELETE_MATERIAL',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  ASSIGN_MATERIAL: 'ASSIGN_MATERIAL'
};

// Singleton instance
const offlineQueueService = new OfflineQueueService();

export default offlineQueueService;
