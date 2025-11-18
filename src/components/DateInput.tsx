import React, { useState } from 'react';

interface DateInputProps {
  id: string;
  label: string;
  value: string; // ISO format: YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string;
}

export const DateInput: React.FC<DateInputProps> = ({ id, label, value, onChange, minDate }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Convert ISO date to dd/mm/yyyy for display
  const isoToDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convert dd/mm/yyyy to ISO format
  const displayToIso = (displayDate: string): string => {
    if (!displayDate) return '';
    const parts = displayDate.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (!/^\d{2}$/.test(day) || !/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) return '';
    return `${year}-${month}-${day}`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Auto-format as user types: dd/mm/yyyy
    if (inputValue.length === 2 && !inputValue.includes('/')) {
      inputValue += '/';
    } else if (inputValue.length === 5 && inputValue.split('/').length === 2) {
      inputValue += '/';
    }

    setDisplayValue(inputValue);

    // If complete format, convert to ISO
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(inputValue)) {
      const isoDate = displayToIso(inputValue);
      if (isoDate) {
        onChange(isoDate);
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    onChange(isoDate);
    setDisplayValue(isoToDisplay(isoDate));
  };

  // Update display value when value prop changes
  React.useEffect(() => {
    if (value) {
      setDisplayValue(isoToDisplay(value));
    }
  }, [value]);

  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          id={`${id}-text`}
          type="text"
          value={displayValue}
          onChange={handleTextChange}
          placeholder="dd/mm/yyyy"
          maxLength={10}
          style={{
            flex: '1',
            padding: '0.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
        />
        <input
          id={id}
          type="date"
          value={value}
          onChange={handleDatePickerChange}
          min={minDate}
          style={{
            padding: '0.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
};
