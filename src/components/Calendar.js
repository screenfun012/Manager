import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  getCurrentBelgradeDate,
  getCurrentMonthName,
  getPreviousMonthName,
  getNextMonthName,
  getFirstDayOfCurrentMonth,
  getFirstDayOfPreviousMonth,
  getFirstDayOfNextMonth,
  getLastDayOfCurrentMonth,
  getLastDayOfPreviousMonth,
  getLastDayOfNextMonth,
  formatDateForDisplay,
  isInCurrentMonth
} from '../services/dateUtils';

const Calendar = ({ selectedPeriod, onPeriodChange, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(getCurrentBelgradeDate());
  const [viewMonth, setViewMonth] = useState(selectedPeriod ? selectedPeriod.from.getMonth() : getCurrentBelgradeDate().getMonth());
  const [viewYear, setViewYear] = useState(selectedPeriod ? selectedPeriod.from.getFullYear() : getCurrentBelgradeDate().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDayForEvent, setSelectedDayForEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  // Mesec nazivi na srpskom
  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  // Dan nazivi na srpskom
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];

  // Ažuriraj viewMonth i viewYear kada se promeni selectedPeriod
  useEffect(() => {
    if (selectedPeriod) {
      setViewMonth(selectedPeriod.from.getMonth());
      setViewYear(selectedPeriod.from.getFullYear());
    }
  }, [selectedPeriod]);

  // Generiši kalendar za trenutni mesec
  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);
    const today = getCurrentBelgradeDate();

    // Generiši 6 nedelja (42 dana)
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isInSelectedPeriod = selectedPeriod &&
          date >= selectedPeriod.from &&
          date <= selectedPeriod.to;
        const isReadOnly = date < new Date(today.getFullYear(), today.getMonth(), 1);

        weekDays.push({
          date,
          day: date.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          isInSelectedPeriod,
          isReadOnly
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }

    return calendar;
  };

  // Navigacija po mesecima
  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    const now = getCurrentBelgradeDate();
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  };

  // Navigacija po godinama
  const goToPreviousYear = () => {
    setViewYear(viewYear - 1);
  };

  const goToNextYear = () => {
    setViewYear(viewYear + 1);
  };

  // Event funkcije
  const getEventsForDate = (date) => {
    const dateKey = date.toDateString();
    return events[dateKey] || [];
  };

  const addEvent = (date, title, description) => {
    const dateKey = date.toDateString();
    const newEvent = {
      id: Date.now(),
      title,
      description,
      date: new Date(date)
    };

    setEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent]
    }));
  };

  const deleteEvent = (date, eventId) => {
    const dateKey = date.toDateString();
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
    }));
  };

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !selectedDayForEvent) return;

    addEvent(selectedDayForEvent, eventTitle, eventDescription);
    setEventTitle('');
    setEventDescription('');
    setShowEventForm(false);
    setSelectedDayForEvent(null);
  };

  // Izbor datuma
  const handleDateClick = (dateInfo) => {
    setSelectedDate(dateInfo.date);

    // Kreiraj period za izabrani mesec
    const period = {
      from: new Date(dateInfo.date.getFullYear(), dateInfo.date.getMonth(), 1),
      to: new Date(dateInfo.date.getFullYear(), dateInfo.date.getMonth() + 1, 0),
      label: `${monthNames[dateInfo.date.getMonth()]} ${dateInfo.date.getFullYear()}`
    };

    onPeriodChange(period);

    if (onDateSelect) {
      onDateSelect(dateInfo.date);
    }
  };

  // Dupli klik za dodavanje eventa
  const handleDateDoubleClick = (dateInfo) => {
    if (dateInfo.isReadOnly) return;
    setSelectedDayForEvent(dateInfo.date);
    setShowEventForm(true);
  };

  // Izbor celog meseca
  const handleMonthClick = (month, year) => {
    const period = {
      from: new Date(year, month, 1),
      to: new Date(year, month + 1, 0),
      label: `${monthNames[month]} ${year}`
    };

    onPeriodChange(period);
    setViewMonth(month);
    setViewYear(year);
  };

  // Sinhronizuj sa trenutnim periodom
  useEffect(() => {
    if (selectedPeriod) {
      const periodDate = new Date(selectedPeriod.from);
      setViewMonth(periodDate.getMonth());
      setViewYear(periodDate.getFullYear());
    }
  }, [selectedPeriod]);

  const calendar = generateCalendar(viewMonth, viewYear);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {/* Navigacija po godinama */}
        <div className="calendar-year-navigation">
          <button
            onClick={goToPreviousYear}
            className="calendar-nav-btn"
            title="Prethodna godina"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="calendar-year">{viewYear}</span>
          <button
            onClick={goToNextYear}
            className="calendar-nav-btn"
            title="Sledeća godina"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Navigacija po mesecima */}
        <div className="calendar-navigation">
          <button
            onClick={goToPreviousMonth}
            className="calendar-nav-btn"
            title="Prethodni mesec"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="calendar-month-year">
            <h3>{monthNames[viewMonth]} {viewYear}</h3>
            <button
              onClick={goToCurrentMonth}
              className="calendar-current-btn"
              title="Idi na tekući mesec"
            >
              <CalendarIcon size={16} />
              Danas
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="calendar-nav-btn"
            title="Sledeći mesec"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Dan nazivi */}
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Kalendar dana */}
        <div className="calendar-days">
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((dayInfo, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => handleDateClick(dayInfo)}
                  onDoubleClick={() => handleDateDoubleClick(dayInfo)}
                  className={`calendar-day ${
                    !dayInfo.isCurrentMonth ? 'other-month' : ''
                  } ${
                    dayInfo.isToday ? 'today' : ''
                  } ${
                    dayInfo.isSelected ? 'selected' : ''
                  } ${
                    dayInfo.isInSelectedPeriod ? 'in-period' : ''
                  } ${
                    getEventsForDate(dayInfo.date).length > 0 ? 'has-events' : ''
                  }`}
                  disabled={dayInfo.isReadOnly}
                  title={
                    dayInfo.isReadOnly
                      ? 'Prošli meseci su read-only'
                      : getEventsForDate(dayInfo.date).length > 0
                        ? `${formatDateForDisplay(dayInfo.date)} - ${getEventsForDate(dayInfo.date).length} događaja`
                        : `Izaberi ${formatDateForDisplay(dayInfo.date)} (dupli klik za događaj)`
                  }
                >
                  <div className="calendar-day-content">
                    <span className="calendar-day-number">{dayInfo.day}</span>
                    {getEventsForDate(dayInfo.date).length > 0 && (
                      <div className="calendar-day-events">
                        <div className="calendar-event-dot"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Event forma */}
      {showEventForm && selectedDayForEvent && (
        <div className="calendar-event-form-overlay">
          <div className="calendar-event-form">
            <h4>Dodaj događaj</h4>
            <p className="calendar-event-date">
              {formatDateForDisplay(selectedDayForEvent)}
            </p>

            <div className="calendar-form-group">
              <label>Naslov događaja *</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Unesite naslov događaja"
                maxLength={50}
              />
            </div>

            <div className="calendar-form-group">
              <label>Opis (opciono)</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Unesite opis događaja"
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="calendar-form-actions">
              <button
                onClick={handleAddEvent}
                className="calendar-btn-primary"
                disabled={!eventTitle.trim()}
              >
                Dodaj događaj
              </button>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setSelectedDayForEvent(null);
                  setEventTitle('');
                  setEventDescription('');
                }}
                className="calendar-btn-secondary"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista eventa za izabrani dan */}
      {selectedDate && getEventsForDate(selectedDate).length > 0 && (
        <div className="calendar-events-list">
          <h4>Događaji za {formatDateForDisplay(selectedDate)}</h4>
          <div className="calendar-events-items">
            {getEventsForDate(selectedDate).map(event => (
              <div key={event.id} className="calendar-event-item">
                <div className="calendar-event-content">
                  <h5>{event.title}</h5>
                  {event.description && <p>{event.description}</p>}
                </div>
                <button
                  onClick={() => deleteEvent(selectedDate, event.id)}
                  className="calendar-event-delete"
                  title="Obriši događaj"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;