/**
 * WhatsApp messaging utilities for Trial Master Pro
 * Phase 1: Uses wa.me click-to-chat links (user clicks send)
 * Phase 2: Can upgrade to WhatsApp Business API for full automation
 */

export interface WhatsAppMessage {
  phoneNumber: string;
  participantName: string;
  messageType?: 'check_in_confirmation' | 'trial_reminder' | 'custom';
  customMessage?: string;
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
 */
const getHebrewMessage = (
  type: string,
  participantName: string,
  customMessage?: string
): string => {
  switch (type) {
    case 'check_in_confirmation':
      return (
        `שלום ${participantName}! ✅\n\n` +
        `תודה שמילאת את טופס ההרשמה לניסוי.\n` +
        `פרטיך נקלטו בהצלחה במערכת.\n\n` +
        `נתראה בקרוב!\n` +
        `צוות Trial Master Pro 🔬`
      );

    case 'trial_reminder':
      return (
        `שלום ${participantName},\n\n` +
        `זוהי תזכורת לניסוי שלך מחר.\n` +
        `נא להגיע בזמן.\n\n` +
        `צוות Trial Master Pro 📅`
      );

    case 'custom':
      return customMessage || `שלום ${participantName}`;

    default:
      return `שלום ${participantName}`;
  }
};

/**
 * Open WhatsApp Web/App with pre-filled Hebrew message
 * User must click "Send" button to complete the action
 *
 * Uses wa.me click-to-chat link format:
 * https://wa.me/[phone]?text=[message]
 *
 * @param phoneNumber Israeli format (050-xxx) or international (+972xxx)
 * @param participantName Name to personalize message
 * @param messageType Type of message template to use
 * @param customMessage Custom message (only used if messageType='custom')
 */
export const sendWhatsAppMessage = ({
  phoneNumber,
  participantName,
  messageType = 'check_in_confirmation',
  customMessage,
}: WhatsAppMessage): void => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = getHebrewMessage(messageType, participantName, customMessage);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
};

/**
 * Generate WhatsApp URL without opening
 * Useful for displaying link in UI or in chat messages
 */
export const getWhatsAppLink = ({
  phoneNumber,
  participantName,
  messageType = 'check_in_confirmation',
  customMessage,
}: WhatsAppMessage): string => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = getHebrewMessage(messageType, participantName, customMessage);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
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
