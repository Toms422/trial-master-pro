import React, { useState } from 'react';

interface TimeInputProps {
  id: string;
  label: string;
  value: string; // HH:mm format
  onChange: (value: string) => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ id, label, value, onChange }) => {
  const [displayValue, setDisplayValue] = useState(value);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.toUpperCase();

    // Auto-format as user types: HH:mm
    if (inputValue.length === 2 && !inputValue.includes(':')) {
      inputValue += ':';
    }

    setDisplayValue(inputValue);

    // If complete format HH:mm, validate and update
    if (/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleTimePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    setDisplayValue(timeValue);
    onChange(timeValue);
  };

  React.useEffect(() => {
    if (value && !displayValue) {
      setDisplayValue(value);
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
          placeholder="HH:mm"
          maxLength="5"
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: 'inherit',
          }}
        />
        <input
          id={id}
          type="time"
          value={value}
          onChange={handleTimePickerChange}
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
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
        24-hour format (HH:mm)
      </div>
    </div>
  );
};
