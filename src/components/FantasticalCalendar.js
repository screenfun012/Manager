import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Filter,
  Search,
  Settings,
  Sun,
  Moon,
  Star,
  Zap
} from 'lucide-react';

const FantasticalCalendar = ({ selectedPeriod, onPeriodChange, onDateSelect, assignments = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // day, week, month, year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light'); // light, dark, auto
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Application color palette (matching the app style)
  const colors = {
    primary: '#dc2626', // Red theme like the app
    secondary: '#374151',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6',
    indigo: '#6366f1',
    orange: '#f97316',
    red: '#dc2626',
    green: '#10b981',
    blue: '#3b82f6',
    yellow: '#eab308',
    gray: '#6b7280',
    lightGray: '#f3f4f6',
    darkGray: '#1f2937',
    white: '#ffffff',
    black: '#000000',
    background: '#111827',
    surface: '#1f2937',
    border: '#374151'
  };

  // Event categories with Fantastical-style colors
  const eventCategories = [
    { id: 'work', name: 'Work', color: colors.blue, icon: '💼' },
    { id: 'personal', name: 'Personal', color: colors.green, icon: '👤' },
    { id: 'meeting', name: 'Meeting', color: colors.purple, icon: '👥' },
    { id: 'travel', name: 'Travel', color: colors.orange, icon: '✈️' },
    { id: 'health', name: 'Health', color: colors.red, icon: '🏥' },
    { id: 'family', name: 'Family', color: colors.pink, icon: '👨‍👩‍👧‍👦' },
    { id: 'hobby', name: 'Hobby', color: colors.teal, icon: '🎨' },
    { id: 'education', name: 'Education', color: colors.indigo, icon: '📚' }
  ];

  // Sample events data (in real app, this would come from props/API)
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Team Meeting',
      start: new Date(2024, 11, 15, 10, 0),
      end: new Date(2024, 11, 15, 11, 0),
      category: 'meeting',
      location: 'Conference Room A',
      attendees: ['John Doe', 'Jane Smith'],
      description: 'Weekly team sync meeting',
      allDay: false,
      recurring: 'weekly'
    },
    {
      id: 2,
      title: 'Doctor Appointment',
      start: new Date(2024, 11, 16, 14, 30),
      end: new Date(2024, 11, 16, 15, 30),
      category: 'health',
      location: 'Medical Center',
      attendees: [],
      description: 'Annual checkup',
      allDay: false,
      recurring: null
    },
    {
      id: 3,
      title: 'Project Deadline',
      start: new Date(2024, 11, 20, 0, 0),
      end: new Date(2024, 11, 20, 23, 59),
      category: 'work',
      location: '',
      attendees: [],
      description: 'Submit final project',
      allDay: true,
      recurring: null
    }
  ]);

  // Get current month name
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get events for current view
  const getEventsForView = () => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        endDate.setDate(endDate.getDate() + (6 - dayOfWeek));
        break;
      case 'month':
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31);
        break;
    }
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  // Filter events based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEvents(getEventsForView());
    } else {
      const filtered = getEventsForView().filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, currentDate, viewMode, events]);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Event handlers
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    return (
      <div className="fantastical-day-view">
        <div className="day-header">
          <h2>{selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h2>
        </div>
        
        <div className="day-events">
          {dayEvents.length === 0 ? (
            <div className="no-events">
              <CalendarIcon size={48} color={colors.gray} />
              <p>No events scheduled</p>
              <button onClick={handleAddEvent} className="add-event-btn">
                <Plus size={16} />
                Add Event
              </button>
            </div>
          ) : (
            <div className="events-list">
              {dayEvents.map(event => (
                <div 
                  key={event.id} 
                  className="event-card"
                  onClick={() => handleEventClick(event)}
                >
                  <div 
                    className="event-color-bar" 
                    style={{ backgroundColor: eventCategories.find(c => c.id === event.category)?.color || colors.blue }}
                  />
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <div className="event-details">
                      <div className="event-time">
                        <Clock size={14} />
                        {event.allDay ? 'All day' : `${event.start.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })} - ${event.end.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}`}
                      </div>
                      {event.location && (
                        <div className="event-location">
                          <MapPin size={14} />
                          {event.location}
                        </div>
                      )}
                      {event.attendees.length > 0 && (
                        <div className="event-attendees">
                          <Users size={14} />
                          {event.attendees.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return (
      <div className="fantastical-week-view">
        <div className="week-header">
          {weekDays.map(day => (
            <div key={day.toISOString()} className="week-day-header">
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className={`day-number ${day.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="week-grid">
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day);
            return (
              <div key={day.toISOString()} className="week-day">
                <div className="day-events">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="week-event"
                      style={{ 
                        backgroundColor: eventCategories.find(c => c.id === event.category)?.color || colors.blue,
                        color: 'white'
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="fantastical-month-view">
        <div className="month-header">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        
        <div className="month-grid">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="month-day empty" />;
            }
            
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            
            return (
              <div 
                key={day.toISOString()} 
                className={`month-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-number">{day.getDate()}</div>
                <div className="day-events">
                  {dayEvents.slice(0, 3).map(event => (
                    <div 
                      key={event.id} 
                      className="month-event"
                      style={{ 
                        backgroundColor: eventCategories.find(c => c.id === event.category)?.color || colors.blue,
                        color: 'white'
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="more-events">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render year view
  const renderYearView = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(currentDate.getFullYear(), i, 1));
    }
    
    return (
      <div className="fantastical-year-view">
        <div className="year-grid">
          {months.map(month => (
            <div key={month.toISOString()} className="year-month">
              <h3>{month.toLocaleDateString('en-US', { month: 'long' })}</h3>
              <div className="year-month-grid">
                {getDaysInMonth(month).map((day, index) => {
                  if (!day) return <div key={index} className="year-day empty" />;
                  
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`year-day ${hasEvents ? 'has-events' : ''}`}
                      onClick={() => {
                        setCurrentDate(day);
                        setViewMode('month');
                        setSelectedDate(day);
                      }}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };

  return (
    <div className="fantastical-calendar" style={{ 
      background: theme === 'dark' ? colors.darkGray : colors.white,
      color: theme === 'dark' ? colors.white : colors.black
    }}>
      {/* Header */}
      <div className="fantastical-header">
        <div className="header-left">
          <h1 className="calendar-title">
            <CalendarIcon size={24} />
            Fantastical Calendar
          </h1>
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${viewMode === 'year' ? 'active' : ''}`}
              onClick={() => setViewMode('year')}
            >
              Year
            </button>
          </div>
        </div>
        
        <div className="header-center">
          <div className="navigation">
            <button onClick={goToPrevious} className="nav-btn">
              <ChevronLeft size={20} />
            </button>
            <h2 className="current-period">
              {viewMode === 'day' 
                ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : viewMode === 'week'
                ? `Week of ${selectedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}`
                : viewMode === 'month'
                ? getMonthName(currentDate)
                : currentDate.getFullYear()
              }
            </h2>
            <button onClick={goToNext} className="nav-btn">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button onClick={goToToday} className="today-btn">
            Today
          </button>
          
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button onClick={handleAddEvent} className="add-btn">
            <Plus size={16} />
            Add Event
          </button>
          
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            <Settings size={16} />
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Settings</h3>
          <div className="setting-group">
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Calendar Content */}
      <div className="fantastical-content">
        {renderCurrentView()}
      </div>
      
      {/* Event Form Modal */}
      {showEventForm && (
        <div className="event-form-modal">
          <div className="modal-content">
            <h2>Add New Event</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowEventForm(false);
            }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="Event title" required />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select required>
                  {eventCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Event location" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Event description" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowEventForm(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .fantastical-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          height: 100vh;
          min-height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: ${colors.background};
          color: ${colors.white};
        }
        
        .fantastical-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-bottom: 2px solid ${colors.border};
          background: ${colors.surface};
          flex-shrink: 0;
          min-height: 80px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .fantastical-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            min-height: auto;
          }
          
          .header-left {
            order: 1;
            width: 100%;
            justify-content: center;
          }
          
          .header-center {
            order: 2;
            width: 100%;
          }
          
          .header-right {
            order: 3;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .calendar-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: ${colors.white};
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .calendar-title {
            font-size: 1.3rem;
          }
        }
        
        @media (max-width: 480px) {
          .calendar-title {
            font-size: 1.1rem;
          }
        }
        
        .view-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .view-controls {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .view-btn {
            flex: 1;
            min-width: 60px;
            text-align: center;
          }
        }
        
        .view-btn {
          padding: 0.5rem 1rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .view-btn:hover {
          background: ${colors.border};
          border-color: ${colors.primary};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        .view-btn.active {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
        }
        
        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        
        .navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .nav-btn {
          padding: 0.5rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .nav-btn:hover {
          background: ${colors.border};
          border-color: ${colors.primary};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        .current-period {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${colors.white};
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .current-period {
            font-size: 1.1rem;
            text-align: center;
          }
          
          .navigation {
            gap: 0.5rem;
          }
          
          .nav-btn {
            padding: 0.4rem;
          }
        }
        
        @media (max-width: 480px) {
          .current-period {
            font-size: 1rem;
          }
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .today-btn {
          padding: 0.5rem 1rem;
          border: 2px solid ${colors.primary};
          border-radius: 8px;
          background: ${colors.primary};
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        .today-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-container svg {
          position: absolute;
          left: 0.75rem;
          color: ${colors.primary};
        }
        
        .search-input {
          padding: 0.5rem 0.75rem 0.5rem 2rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          width: 200px;
          font-weight: 500;
        }
        
        .search-input:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
        }
        
        @media (max-width: 768px) {
          .search-input {
            width: 150px;
            min-width: 120px;
          }
          
          .header-right {
            gap: 0.5rem;
          }
          
          .today-btn, .add-btn {
            padding: 0.5rem;
            font-size: 0.9rem;
          }
          
          .add-btn span {
            display: none;
          }
        }
        
        .add-btn {
          padding: 0.5rem 1rem;
          border: 2px solid ${colors.primary};
          border-radius: 8px;
          background: ${colors.primary};
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        .add-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        
        .settings-btn {
          padding: 0.5rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .settings-btn:hover {
          background: ${colors.border};
          border-color: ${colors.primary};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        .fantastical-content {
          flex: 1;
          padding: 1rem 2rem;
          overflow-y: auto;
          min-height: 0;
          background: ${colors.background};
        }
        
        @media (max-width: 768px) {
          .fantastical-content {
            padding: 0.5rem 1rem;
          }
        }
        
        /* Day View Styles */
        .fantastical-day-view {
          height: 100%;
        }
        
        .day-header h2 {
          margin: 0 0 2rem 0;
          font-size: 2rem;
          font-weight: 600;
          color: ${colors.white};
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .day-header h2 {
            font-size: 1.5rem;
            margin: 0 0 1.5rem 0;
          }
        }
        
        @media (max-width: 480px) {
          .day-header h2 {
            font-size: 1.3rem;
            margin: 0 0 1rem 0;
          }
        }
        
        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: ${colors.gray};
          background: ${colors.surface};
          border: 2px solid ${colors.border};
          border-radius: 12px;
          padding: 2rem;
        }
        
        @media (max-width: 768px) {
          .no-events {
            height: 300px;
            padding: 1rem;
          }
          
          .no-events svg {
            width: 36px;
            height: 36px;
          }
          
          .no-events p {
            font-size: 0.9rem;
            text-align: center;
          }
        }
        
        .add-event-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          border: 2px solid ${colors.primary};
          border-radius: 8px;
          background: ${colors.primary};
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        @media (max-width: 768px) {
          .add-event-btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .add-event-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
        }
        
        .add-event-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .event-card {
          display: flex;
          border: 2px solid ${colors.border};
          border-radius: 12px;
          background: ${colors.surface};
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
          .event-card {
            border-radius: 8px;
          }
          
          .event-content {
            padding: 0.75rem;
          }
          
          .event-content h3 {
            font-size: 1rem;
          }
          
          .event-details > div {
            font-size: 0.8rem;
          }
        }
        
        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
          border-color: ${colors.primary};
        }
        
        .event-color-bar {
          width: 4px;
          background: ${colors.primary};
        }
        
        .event-content {
          padding: 1rem;
          flex: 1;
        }
        
        .event-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: ${colors.white};
        }
        
        .event-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .event-details > div {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: ${colors.gray};
        }
        
        /* Month View Styles */
        .fantastical-month-view {
          height: 100%;
        }
        
        .month-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1rem;
        }
        
        .weekday-header {
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: ${colors.white};
          background: ${colors.surface};
          border: 1px solid ${colors.border};
        }
        
        @media (max-width: 768px) {
          .weekday-header {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .weekday-header {
            padding: 0.5rem 0.25rem;
            font-size: 0.8rem;
          }
        }
        
        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          flex: 1;
        }
        
        .month-day {
          min-height: 120px;
          padding: 0.5rem;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        @media (max-width: 768px) {
          .month-day {
            min-height: 80px;
            padding: 0.25rem;
          }
          
          .month-event {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
          }
          
          .day-number {
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .month-day {
            min-height: 60px;
            padding: 0.2rem;
          }
          
          .month-event {
            font-size: 0.6rem;
            padding: 0.1rem 0.3rem;
          }
          
          .day-number {
            font-size: 0.8rem;
          }
        }
        
        .month-day:hover {
          background: ${colors.border};
          border-color: ${colors.primary};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }
        
        .month-day.today {
          background: rgba(220, 38, 38, 0.2);
          border-color: ${colors.primary};
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        .month-day.selected {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        
        .month-day.empty {
          background: ${colors.background};
          cursor: default;
        }
        
        .day-number {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: ${colors.white};
        }
        
        .day-events {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .month-event {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .more-events {
          font-size: 0.8rem;
          color: ${colors.primary};
          font-style: italic;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .more-events {
            font-size: 0.7rem;
          }
        }
        
        @media (max-width: 480px) {
          .more-events {
            font-size: 0.6rem;
          }
        }
        
        /* Week View Styles */
        .fantastical-week-view {
          height: 100%;
        }
        
        .week-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1rem;
        }
        
        .week-day-header {
          padding: 1rem;
          text-align: center;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
        }
        
        @media (max-width: 768px) {
          .week-day-header {
            padding: 0.75rem 0.5rem;
          }
          
          .day-name {
            font-size: 0.9rem;
          }
          
          .day-number {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 480px) {
          .week-day-header {
            padding: 0.5rem 0.25rem;
          }
          
          .day-name {
            font-size: 0.8rem;
          }
          
          .day-number {
            font-size: 1rem;
          }
        }
        
        .day-name {
          font-weight: 600;
          color: ${colors.white};
          margin-bottom: 0.5rem;
        }
        
        .day-number {
          font-size: 1.2rem;
          font-weight: 600;
          color: ${colors.white};
        }
        
        .day-number.selected {
          color: ${colors.primary};
        }
        
        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          flex: 1;
        }
        
        .week-day {
          min-height: 200px;
          padding: 0.5rem;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
        }
        
        @media (max-width: 768px) {
          .week-day {
            min-height: 120px;
            padding: 0.25rem;
          }
          
          .week-event {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
          }
        }
        
        @media (max-width: 480px) {
          .week-day {
            min-height: 80px;
            padding: 0.2rem;
          }
          
          .week-event {
            font-size: 0.6rem;
            padding: 0.1rem 0.3rem;
          }
        }
        
        .week-event {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Year View Styles */
        .fantastical-year-view {
          height: 100%;
        }
        
        .year-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        
        @media (max-width: 768px) {
          .year-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .year-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        
        .year-month {
          border: 2px solid ${colors.border};
          border-radius: 12px;
          padding: 1rem;
          background: ${colors.surface};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .year-month {
            padding: 0.75rem;
          }
          
          .year-month h3 {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .year-month {
            padding: 0.5rem;
          }
          
          .year-month h3 {
            font-size: 0.9rem;
          }
        }
        
        .year-month h3 {
          margin: 0 0 1rem 0;
          text-align: center;
          color: ${colors.white};
          font-weight: 600;
        }
        
        .year-month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        
        .year-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
          color: ${colors.white};
        }
        
        @media (max-width: 768px) {
          .year-day {
            font-size: 0.7rem;
          }
        }
        
        @media (max-width: 480px) {
          .year-day {
            font-size: 0.6rem;
          }
        }
        
        .year-day:hover {
          background: ${colors.border};
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        .year-day.has-events {
          background: rgba(220, 38, 38, 0.2);
          color: ${colors.primary};
          font-weight: 600;
          border: 1px solid ${colors.primary};
        }
        
        .year-day.empty {
          cursor: default;
        }
        
        /* Modal Styles */
        .event-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: ${colors.surface};
          border: 2px solid ${colors.border};
          border-radius: 12px;
          padding: 2rem;
          width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        @media (max-width: 768px) {
          .modal-content {
            width: 90vw;
            max-width: 500px;
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .modal-content {
            width: 95vw;
            padding: 1rem;
          }
        }
        
        .modal-content h2 {
          margin: 0 0 1.5rem 0;
          color: ${colors.white};
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .modal-content h2 {
            font-size: 1.3rem;
            margin: 0 0 1rem 0;
          }
        }
        
        @media (max-width: 480px) {
          .modal-content h2 {
            font-size: 1.1rem;
            margin: 0 0 0.75rem 0;
          }
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
          .form-group {
            margin-bottom: 0.75rem;
          }
          
          .form-group label {
            font-size: 0.9rem;
          }
          
          .form-group input,
          .form-group select,
          .form-group textarea {
            font-size: 0.9rem;
          }
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: ${colors.white};
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          font-size: 1rem;
          font-weight: 500;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
        }
        
        @media (max-width: 768px) {
          .form-group input,
          .form-group select,
          .form-group textarea {
            padding: 0.6rem;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .form-group input,
          .form-group select,
          .form-group textarea {
            padding: 0.5rem;
            font-size: 0.8rem;
          }
        }
        
        .form-group textarea {
          height: 100px;
          resize: vertical;
        }
        
        @media (max-width: 768px) {
          .form-group textarea {
            height: 80px;
          }
        }
        
        @media (max-width: 480px) {
          .form-group textarea {
            height: 60px;
          }
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .form-actions {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .form-actions button {
            width: 100%;
          }
        }
        
        .form-actions button {
          padding: 0.75rem 1.5rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .form-actions button {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .form-actions button {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
        }
        
        .form-actions button[type="submit"] {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
        }
        
        .form-actions button:hover {
          background: ${colors.border};
          border-color: ${colors.primary};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        @media (max-width: 768px) {
          .form-actions button:hover {
            transform: none;
          }
        }
        
        .form-actions button[type="submit"]:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        
        @media (max-width: 768px) {
          .form-actions button[type="submit"]:hover {
            transform: none;
          }
        }
        
        /* Settings Panel */
        .settings-panel {
          position: absolute;
          top: 100%;
          right: 2rem;
          background: ${colors.surface};
          border: 2px solid ${colors.border};
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          z-index: 100;
        }
        
        @media (max-width: 768px) {
          .settings-panel {
            right: 1rem;
            left: 1rem;
            width: auto;
          }
        }
        
        .settings-panel h3 {
          margin: 0 0 1rem 0;
          color: ${colors.white};
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .settings-panel h3 {
            font-size: 1rem;
          }
        }
        
        .setting-group {
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
          .setting-group {
            margin-bottom: 0.75rem;
          }
          
          .setting-group label {
            font-size: 0.9rem;
          }
          
          .setting-group select {
            font-size: 0.9rem;
          }
        }
        
        .setting-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: ${colors.white};
        }
        
        .setting-group select {
          width: 100%;
          padding: 0.5rem;
          border: 2px solid ${colors.border};
          border-radius: 8px;
          background: ${colors.surface};
          color: ${colors.white};
          font-weight: 500;
        }
        
        .setting-group select:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
        }
        
        @media (max-width: 768px) {
          .setting-group select {
            padding: 0.4rem;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .setting-group select {
            padding: 0.3rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FantasticalCalendar;
