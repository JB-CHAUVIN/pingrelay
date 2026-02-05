/**
 * Frontend error messages translation
 * Maps error codes to user-friendly French messages
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Template errors
  TEMPLATE_NOT_FOUND: "Template non trouvé",

  // Phone errors
  PHONE_NOT_FOUND: "Téléphone non trouvé",
  PHONE_NOT_CONNECTED: "Téléphone non connecté",

  // Group errors
  GROUP_NOT_FOUND: "Groupe WhatsApp non trouvé",
  GROUP_ID_MISSING: "ID du groupe manquant",

  // Message sending errors
  MESSAGE_SEND_FAILED: "Échec de l'envoi du message",
  IMAGE_SEND_FAILED: "Échec de l'envoi de l'image",
  VIDEO_SEND_FAILED: "Échec de l'envoi de la vidéo",

  // General errors
  UNKNOWN_ERROR: "Erreur inconnue",
};

/**
 * Get translated error message
 */
export function getErrorMessage(errorCode?: string): string {
  if (!errorCode) return "";
  return ERROR_MESSAGES[errorCode] || errorCode;
}

/**
 * Format error with data
 */
export function formatError(
  errorCode?: string,
  errorData?: Record<string, any>
): string {
  const message = getErrorMessage(errorCode);

  if (!errorData || Object.keys(errorData).length === 0) {
    return message;
  }

  const details = Object.entries(errorData)
    .map(([key, value]) => {
      // Format specific keys for better readability
      if (key === "phone") return `Tél: ${value}`;
      if (key === "groupName") return `Groupe: ${value}`;
      if (key === "status") return `Statut: ${value}`;
      return `${key}: ${value}`;
    })
    .join(", ");

  return `${message} (${details})`;
}
