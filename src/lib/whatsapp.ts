/**
 * WhatsApp messaging utilities for Trial Master Pro
 * Phase 1: Uses WhatsApp Web click-to-chat links (user clicks send)
 * Phase 2: Can upgrade to WhatsApp Business API for full automation
 *
 * Note: Automatic message sending is not supported by WhatsApp for security reasons.
 * Users must manually click "Send" button in the WhatsApp Web interface.
 */

export interface WhatsAppMessage {
  phoneNumber: string;
  participantName: string;
  messageType?: 'check_in_confirmation' | 'trial_reminder' | 'custom';
  customMessage?: string;
  qrId?: string; // Optional QR code ID for check-in form link
}

/**
 * Format phone number to remove all non-digit characters
 * Accepts: "050-1234567", "0501234567", "+972501234567"
 * Returns: "972501234567" (international format for wa.me)
 */
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Convert Israeli format (05x) to international (+972)
  if (cleaned.startsWith('0')) {
    return '972' + cleaned.substring(1);
  }

  return cleaned;
};

/**
 * Get Hebrew message template based on message type
 * Includes clickable form link if QR ID is provided
 */
const getHebrewMessage = (
  type: string,
  participantName: string,
  customMessage?: string,
  qrId?: string
): string => {
  const formLink = qrId ? `\n\n${window.location.origin}/check-in/${qrId}` : '';

  switch (type) {
    case 'check_in_confirmation':
      return (
        `שלום ${participantName}! ✅\n\n` +
        `תודה שמילאת את טופס ההרשמה לניסוי.\n` +
        `פרטיך נקלטו בהצלחה במערכת.${formLink}\n\n` +
        `נתראה בקרוב!\n` +
        `צוות Trial Master Pro 🔬`
      );

    case 'trial_reminder':
      return (
        `שלום ${participantName},\n\n` +
        `זוהי תזכורת לניסוי שלך מחר.\n` +
        `נא להגיע בזמן.${formLink}\n\n` +
        `צוות Trial Master Pro 📅`
      );

    case 'custom':
      return (customMessage || `שלום ${participantName}`) + formLink;

    default:
      return `שלום ${participantName}` + formLink;
  }
};

/**
 * Open WhatsApp Web with pre-filled Hebrew message
 * User must click "Send" button to complete the action
 *
 * Uses WhatsApp Web link format:
 * https://web.whatsapp.com/send/?phone=[phone]&text=[message]&type=phone_number&app_absent=0
 *
 * Note: Automatic message sending is not supported by WhatsApp for security reasons.
 * User must manually click the "Send" button.
 *
 * @param phoneNumber Israeli format (050-xxx) or international (+972xxx)
 * @param participantName Name to personalize message
 * @param messageType Type of message template to use
 * @param customMessage Custom message (only used if messageType='custom')
 * @param qrId Optional QR code ID to include form link in message
 */
export const sendWhatsAppMessage = ({
  phoneNumber,
  participantName,
  messageType = 'check_in_confirmation',
  customMessage,
  qrId,
}: WhatsAppMessage): void => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = getHebrewMessage(messageType, participantName, customMessage, qrId);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://web.whatsapp.com/send/?phone=${formattedPhone}&text=${encodedMessage}&type=phone_number&app_absent=0`;

    // Open WhatsApp Web in new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
};

/**
 * Generate WhatsApp Web URL without opening
 * Useful for displaying link in UI or in chat messages
 */
export const getWhatsAppLink = ({
  phoneNumber,
  participantName,
  messageType = 'check_in_confirmation',
  customMessage,
  qrId,
}: WhatsAppMessage): string => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = getHebrewMessage(messageType, participantName, customMessage, qrId);
  const encodedMessage = encodeURIComponent(message);
  return `https://web.whatsapp.com/send/?phone=${formattedPhone}&text=${encodedMessage}&type=phone_number&app_absent=0`;
};

/**
 * Phase 2: Async function to send via WhatsApp Business API
 * Will replace sendWhatsAppMessage when Business API is ready
 * Requires Supabase Edge Function: supabase/functions/send-whatsapp/index.ts
 */
export const sendWhatsAppNotificationAsync = async (
  phoneNumber: string,
  participantName: string,
  messageType: 'check_in_confirmation' | 'trial_reminder' = 'check_in_confirmation'
): Promise<{ success: boolean; data?: any; error?: any }> => {
  // This will be implemented in Phase 2 with Supabase Edge Function
  // For now, falls back to click-to-chat
  console.warn(
    'Async WhatsApp Business API not yet configured. Falling back to click-to-chat.'
  );

  try {
    sendWhatsAppMessage({
      phoneNumber,
      participantName,
      messageType,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
