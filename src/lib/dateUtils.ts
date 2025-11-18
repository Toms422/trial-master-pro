/**
 * Date and time utilities for consistent formatting
 */

/**
 * Convert ISO date string (YYYY-MM-DD) to dd/mm/yyyy format
 */
export const formatDateToDDMMYYYY = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Convert dd/mm/yyyy format to ISO date string (YYYY-MM-DD)
 */
export const parseDDMMYYYYToISO = (ddmmyyyy: string): string => {
  if (!ddmmyyyy) return '';
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

/**
 * Format time to 24-hour format (HH:mm)
 */
export const formatTimeTo24hr = (time: string): string => {
  if (!time) return '';
  // time is already in HH:mm format from input type="time"
  return time;
};

/**
 * Validate dd/mm/yyyy date format
 */
export const isValidDDMMYYYY = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Check if it's a valid date
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};
