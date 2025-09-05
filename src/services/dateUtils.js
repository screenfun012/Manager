// Utility funkcije za rad sa datumima u Europe/Belgrade timezone

// Konvertuj UTC datum u Europe/Belgrade timezone
export const toBelgradeTime = (date) => {
  const belgradeDate = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Belgrade"}));
  return belgradeDate;
};

// Dobij trenutni datum u Belgrade timezone
export const getCurrentBelgradeDate = () => {
  return toBelgradeTime(new Date());
};

// Dobij prvi dan tekućeg meseca u Belgrade timezone
export const getFirstDayOfCurrentMonth = () => {
  const now = getCurrentBelgradeDate();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Dobij poslednji dan tekućeg meseca u Belgrade timezone
export const getLastDayOfCurrentMonth = () => {
  const now = getCurrentBelgradeDate();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

// Dobij prvi dan prethodnog meseca u Belgrade timezone
export const getFirstDayOfPreviousMonth = () => {
  const now = getCurrentBelgradeDate();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
};

// Dobij poslednji dan prethodnog meseca u Belgrade timezone
export const getLastDayOfPreviousMonth = () => {
  const now = getCurrentBelgradeDate();
  return new Date(now.getFullYear(), now.getMonth(), 0);
};

// Dobij prvi dan sledećeg meseca u Belgrade timezone
export const getFirstDayOfNextMonth = () => {
  const now = getCurrentBelgradeDate();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

// Dobij poslednji dan sledećeg meseca u Belgrade timezone
export const getLastDayOfNextMonth = () => {
  const now = getCurrentBelgradeDate();
  return new Date(now.getFullYear(), now.getMonth() + 2, 0);
};

// Formatiraj datum za prikaz
export const formatDateForDisplay = (date) => {
  return date.toLocaleDateString('sr-RS', {
    timeZone: 'Europe/Belgrade',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Formatiraj datum za API pozive (YYYY-MM-DD)
export const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

// Formatiraj datum i vreme za API pozive (YYYY-MM-DD HH:mm:ss)
export const formatDateTimeForAPI = (date) => {
  const belgradeDate = toBelgradeTime(date);
  return belgradeDate.toISOString().replace('T', ' ').split('.')[0];
};

// Proveri da li je datum u tekućem mesecu
export const isInCurrentMonth = (date) => {
  const now = getCurrentBelgradeDate();
  const checkDate = toBelgradeTime(new Date(date));
  
  return checkDate.getFullYear() === now.getFullYear() && 
         checkDate.getMonth() === now.getMonth();
};

// Proveri da li je datum u prethodnom mesecu
export const isInPreviousMonth = (date) => {
  const now = getCurrentBelgradeDate();
  const checkDate = toBelgradeTime(new Date(date));
  
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  
  return checkDate.getFullYear() === prevYear && 
         checkDate.getMonth() === prevMonth;
};

// Proveri da li je datum u sledećem mesecu
export const isInNextMonth = (date) => {
  const now = getCurrentBelgradeDate();
  const checkDate = toBelgradeTime(new Date(date));
  
  const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  
  return checkDate.getFullYear() === nextYear && 
         checkDate.getMonth() === nextMonth;
};

// Dobij naziv meseca na srpskom
export const getMonthName = (date) => {
  const months = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];
  
  const belgradeDate = toBelgradeTime(new Date(date));
  return months[belgradeDate.getMonth()];
};

// Dobij naziv tekućeg meseca na srpskom
export const getCurrentMonthName = () => {
  return getMonthName(getCurrentBelgradeDate());
};

// Dobij naziv prethodnog meseca na srpskom
export const getPreviousMonthName = () => {
  const prevMonth = getFirstDayOfPreviousMonth();
  return getMonthName(prevMonth);
};

// Dobij naziv sledećeg meseca na srpskom
export const getNextMonthName = () => {
  const nextMonth = getFirstDayOfNextMonth();
  return getMonthName(nextMonth);
};

// Default period za tekući mesec
export const getDefaultCurrentMonthPeriod = () => {
  return {
    from: getFirstDayOfCurrentMonth(),
    to: getCurrentBelgradeDate(),
    label: `${getCurrentMonthName()} ${getCurrentBelgradeDate().getFullYear()}`
  };
};

// Default period za prethodni mesec
export const getDefaultPreviousMonthPeriod = () => {
  return {
    from: getFirstDayOfPreviousMonth(),
    to: getLastDayOfPreviousMonth(),
    label: `${getPreviousMonthName()} ${getFirstDayOfPreviousMonth().getFullYear()}`
  };
};

// Default period za sledeći mesec
export const getDefaultNextMonthPeriod = () => {
  return {
    from: getFirstDayOfNextMonth(),
    to: getLastDayOfNextMonth(),
    label: `${getNextMonthName()} ${getFirstDayOfNextMonth().getFullYear()}`
  };
};

// Proveri da li je potrebno automatsko prebacivanje na novi mesec
export const shouldAutoSwitchToNewMonth = () => {
  const now = getCurrentBelgradeDate();
  const lastCheck = localStorage.getItem('lastMonthCheck');
  
  if (!lastCheck) {
    localStorage.setItem('lastMonthCheck', now.toISOString());
    return false;
  }
  
  const lastCheckDate = new Date(lastCheck);
  const lastCheckBelgrade = toBelgradeTime(lastCheckDate);
  
  // Proveri da li je prošao novi mesec
  const monthChanged = now.getFullYear() !== lastCheckBelgrade.getFullYear() || 
                      now.getMonth() !== lastCheckBelgrade.getMonth();
  
  if (monthChanged) {
    localStorage.setItem('lastMonthCheck', now.toISOString());
    return true;
  }
  
  return false;
};

// Event za automatsko prebacivanje na novi mesec
export const emitMonthChangedEvent = () => {
  const event = new CustomEvent('monthChanged', {
    detail: {
      newMonth: getCurrentMonthName(),
      newYear: getCurrentBelgradeDate().getFullYear(),
      period: getDefaultCurrentMonthPeriod()
    }
  });
  
  window.dispatchEvent(event);
};
