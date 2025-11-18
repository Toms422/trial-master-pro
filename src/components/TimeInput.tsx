import React from 'react';

interface TimeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ id, label, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Native time input returns HH:mm format
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          fontFamily: 'inherit',
          fontSize: 'inherit',
        }}
      />
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
        Format: HH:mm (24-hour)
      </div>
    </div>
  );
};
