// Event Bus za real-time komunikaciju između komponenti
class EventBus {
  constructor() {
    this.events = {};
  }

  // Pretplati se na event
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Vrati unsubscribe funkciju
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emituj event
  emit(event, data) {
    console.log('🔄 EventBus emit:', event, data);
    if (this.events[event]) {
      console.log(`🔄 EventBus: ${this.events[event].length} subscribers for ${event}`);
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    } else {
      console.log(`🔄 EventBus: No subscribers for ${event}`);
    }
  }

  // Ukloni sve pretplate za event
  unsubscribe(event) {
    delete this.events[event];
  }

  // Ukloni sve pretplate
  clear() {
    this.events = {};
  }
}

// Kreiraj globalnu instancu
const eventBus = new EventBus();

// Event tipovi
export const EVENTS = {
  INVENTORY_UPDATED: 'inventory.updated',
  ASSIGNMENT_CREATED: 'assignment.created',
  ASSIGNMENT_UPDATED: 'assignment.updated',
  ASSIGNMENT_DELETED: 'assignment.deleted',
  MATERIAL_UPDATED: 'material.updated',
  MATERIAL_CREATED: 'material.created',
  MATERIAL_DELETED: 'material.deleted',
  EMPLOYEE_UPDATED: 'employee.updated',
  EMPLOYEE_CREATED: 'employee.created',
  EMPLOYEE_DELETED: 'employee.deleted',
  DEPARTMENT_UPDATED: 'department.updated',
  DEPARTMENT_CREATED: 'department.created',
  DEPARTMENT_DELETED: 'department.deleted',
  ADMIN_REFRESH_NEEDED: 'admin.refresh.needed',
  MONTH_CHANGED: 'month.changed',
  DATA_SYNC_NEEDED: 'data.sync.needed'
};

export default eventBus;
