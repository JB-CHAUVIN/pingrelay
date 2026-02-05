/**
 * TypeScript type definitions for WAHA (WhatsApp HTTP API)
 *
 * These types define the structure of data exchanged with the WAHA API
 * and used throughout the application for WhatsApp integration.
 */

/**
 * Possible statuses for a WAHA session
 */
export type WAHASessionStatus =
  | "STOPPED"     // Session is not running
  | "STARTING"    // Session is initializing
  | "SCAN_QR_CODE"// Waiting for QR code scan
  | "WORKING"     // Session is active and connected
  | "FAILED"      // Session encountered an error
  | "STARTED";    // Session has started but not yet connected

/**
 * Information about the WhatsApp account (me)
 */
export interface WAHAMe {
  id: string;       // WhatsApp ID (e.g., "33612345678@c.us")
  pushName: string; // Display name in WhatsApp
}

/**
 * WAHA session information
 */
export interface WAHASession {
  name: string;                // Session name (phone number)
  status: WAHASessionStatus;   // Current session status
  me?: WAHAMe;                 // Account info (only available when connected)
}

/**
 * Configuration for creating a WAHA session
 */
export interface WAHASessionConfig {
  name: string;  // Session name (phone number in international format)
  config?: {
    proxy?: string;  // Optional proxy configuration
    webhooks?: Array<{
      url: string;     // Webhook URL
      events: string[]; // Events to subscribe to
    }>;
  };
}

/**
 * WAHA API error structure
 */
export interface WAHAError {
  message: string;  // Error message
  status?: number;  // HTTP status code
}

/**
 * Response for QR code endpoint
 */
export interface QRCodeResponse {
  qrCodeUrl: string;  // URL to the QR code image
}

/**
 * Response for phone status endpoint
 */
export interface PhoneStatusResponse {
  status: WAHASessionStatus;  // Current WAHA session status
  connected: boolean;          // Whether the session is connected and working
  me?: WAHAMe;                // Account info if connected
}

/**
 * Response for session start endpoint
 */
export interface SessionStartResponse {
  message: string;            // Success message
  status: WAHASessionStatus;  // New session status
}

/**
 * Response for cron job status check
 */
export interface CronStatusCheckResponse {
  message: string;  // Summary message
  checked: number;  // Number of phones checked
  updated: number;  // Number of phones updated
  errors: number;   // Number of errors encountered
}
