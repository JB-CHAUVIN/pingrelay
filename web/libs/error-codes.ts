/**
 * Structured error codes for message sending
 * Format: ERROR_CODE with associated data
 */

export const ERROR_CODES = {
  // Template errors
  TEMPLATE_NOT_FOUND: "TEMPLATE_NOT_FOUND",

  // Phone errors
  PHONE_NOT_FOUND: "PHONE_NOT_FOUND",
  PHONE_NOT_CONNECTED: "PHONE_NOT_CONNECTED",

  // Group errors
  GROUP_NOT_FOUND: "GROUP_NOT_FOUND",
  GROUP_ID_MISSING: "GROUP_ID_MISSING",

  // Message sending errors
  MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED",
  IMAGE_SEND_FAILED: "IMAGE_SEND_FAILED",
  VIDEO_SEND_FAILED: "VIDEO_SEND_FAILED",

  // Limit errors
  MESSAGE_LIMIT_REACHED: "MESSAGE_LIMIT_REACHED",

  // General errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Error messages for display (can be translated)
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  TEMPLATE_NOT_FOUND: "Template non trouvé",
  PHONE_NOT_FOUND: "Téléphone non trouvé",
  PHONE_NOT_CONNECTED: "Téléphone non connecté",
  GROUP_NOT_FOUND: "Groupe WhatsApp non trouvé",
  GROUP_ID_MISSING: "ID du groupe manquant",
  MESSAGE_LIMIT_REACHED: "Limite de messages mensuelle atteinte",
  MESSAGE_SEND_FAILED: "Échec de l'envoi du message",
  IMAGE_SEND_FAILED: "Échec de l'envoi de l'image",
  VIDEO_SEND_FAILED: "Échec de l'envoi de la vidéo",
  UNKNOWN_ERROR: "Erreur inconnue",
};

/**
 * Helper to format error message with data
 */
export function formatErrorMessage(
  errorCode: ErrorCode,
  errorData?: Record<string, any>
): string {
  const baseMessage = ERROR_MESSAGES[errorCode] || errorCode;

  if (!errorData) {
    return baseMessage;
  }

  const dataStr = Object.entries(errorData)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  return `${baseMessage} (${dataStr})`;
}
