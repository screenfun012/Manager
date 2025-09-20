import { useState, useCallback } from 'react';

const useWarningPopup = () => {
  const [popup, setPopup] = useState({
    isVisible: false,
    message: '',
    position: { top: 0, left: 0 },
    targetElement: null
  });

  const showWarning = useCallback((message, targetElement = null) => {
    let position = { top: 0, left: 0 };
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      position = {
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      };
    }

    setPopup({
      isVisible: true,
      message,
      position,
      targetElement
    });

    // Automatski sakrij popup nakon 5 sekundi
    setTimeout(() => {
      hideWarning();
    }, 5000);
  }, []);

  const hideWarning = useCallback(() => {
    setPopup(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const showFieldWarning = useCallback((fieldName, fieldElement = null) => {
    const messages = {
      materialId: 'Molimo izaberite materijal',
      employeeId: 'Molimo izaberite zaposlenog',
      quantity: 'Molimo unesite količinu',
      name: 'Molimo unesite naziv',
      department: 'Molimo izaberite odeljenje',
      position: 'Molimo unesite poziciju',
      phone: 'Molimo unesite telefon',
      category: 'Molimo izaberite kategoriju',
      stockQuantity: '🚨 GREŠKA!\n\nRealno stanje se ne poklapa sa unetim iznosom!\n\nNema dovoljno materijala na stanju!\n\nMolimo unesite ispravnu količinu!',
      minStock: 'Molimo unesite minimalnu zalihu',
      unit: 'Molimo unesite jedinicu mere',
      username: 'Molimo unesite korisničko ime',
      password: 'Molimo unesite lozinku'
    };

    const message = messages[fieldName] || `Molimo popunite polje: ${fieldName}`;
    showWarning(message, fieldElement);
  }, [showWarning]);

  return {
    popup,
    showWarning,
    hideWarning,
    showFieldWarning
  };
};

export default useWarningPopup;
