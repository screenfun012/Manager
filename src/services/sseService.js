import eventBus, { EVENTS } from './eventBus';

class SSEService {
  constructor() {
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log('📡 Connecting to SSE...');
    
    this.eventSource = new EventSource('http://localhost:5001/api/events');
    
    this.eventSource.onopen = () => {
      console.log('📡 SSE connection opened');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 SSE message received:', data);
        
        // Emit event to event bus
        if (data.type && data.type !== 'connected') {
          console.log('📡 Emitting event to eventBus:', data.type, data.data);
          eventBus.emit(data.type, data.data);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('📡 SSE connection error:', error);
      this.handleReconnect();
    };

    this.eventSource.addEventListener('error', (error) => {
      console.error('📡 SSE event error:', error);
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`📡 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('📡 Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.eventSource) {
      console.log('📡 Disconnecting SSE...');
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  isConnected() {
    return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }
}

// Create singleton instance
const sseService = new SSEService();

export default sseService;
