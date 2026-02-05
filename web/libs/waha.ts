/**
 * WAHA (WhatsApp HTTP API) Integration Library
 *
 * This library provides all functions to interact with the WAHA API for managing
 * WhatsApp sessions. All interactions with WAHA should go through these functions
 * to ensure consistent error handling and logging.
 */

import axios, { AxiosError, AxiosInstance } from "axios";

// ============================================================================
// TYPES
// ============================================================================

export type WAHASessionStatus =
  | "STOPPED"
  | "STARTING"
  | "SCAN_QR_CODE"
  | "WORKING"
  | "FAILED"
  | "STARTED";

export interface WAHAMe {
  id: string;
  pushName: string;
}

export interface WAHASession {
  name: string;
  status: WAHASessionStatus;
  me?: WAHAMe;
}

export interface WAHASessionConfig {
  name: string;
  config?: {
    proxy?: string;
    webhooks?: Array<{ url: string; events: string[] }>;
  };
}

export interface WAHAError {
  message: string;
  status?: number;
}

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

const WAHA_BASE_URL = process.env.WAHA_BASE_URL;
const WAHA_API_KEY = process.env.WAHA_API_KEY;

if (!WAHA_BASE_URL) {
  console.error("WAHA_BASE_URL is not defined in environment variables");
}

if (!WAHA_API_KEY) {
  console.error("WAHA_API_KEY is not defined in environment variables");
}

/**
 * Create Axios client with WAHA configuration
 */
const createWAHAClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: WAHA_BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
      "X-Api-Key": WAHA_API_KEY || "",
      "Content-Type": "application/json",
    },
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      console.log(`[WAHA] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error("[WAHA] Request error:", error);
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const method = error.config?.method?.toUpperCase();
      const baseURL = error.config?.baseURL || "";
      const url = error.config?.url || "";
      const fullUrl = `${baseURL}${url}`;

      console.error(`[WAHA] ${method} ${fullUrl}`);

      if (error.response) {
        console.error(
          `[WAHA] Status ${error.response.status}:`,
          error.response.data,
        );
      } else if (error.request) {
        console.error("[WAHA] No response received");
      } else {
        console.error("[WAHA] Request setup error:", error.message);
      }

      return Promise.reject(error);
    },
  );

  return client;
};

const wahaClient = createWAHAClient();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize phone number by removing spaces, dashes, and parentheses
 * @param phone - Phone number to normalize
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Check if a WAHA session is connected and working
 * @param session - WAHA session object
 * @returns True if session is connected
 */
export function isSessionConnected(session: WAHASession): boolean {
  return session.status === "WORKING" && !!session.me;
}

// ============================================================================
// WAHA API FUNCTIONS
// ============================================================================

/**
 * Create a new WAHA session for a phone number
 * @param phone - Phone number in international format (e.g., +33612345678)
 * @returns Created session information
 * @throws Error if session creation fails
 */
export async function createSession(phone: string): Promise<WAHASession> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const sessionConfig: WAHASessionConfig = {
      name: normalizedPhone,
      config: {},
    };

    const response = await wahaClient.post<WAHASession>(
      `/api/sessions`,
      sessionConfig,
    );

    console.log(`[WAHA] Session created for ${normalizedPhone}`);
    return response.data;
  } catch (error) {
    console.error(`[WAHA] Failed to create session for ${phone}:`, error);
    throw new Error(
      `Failed to create WAHA session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Get information about an existing WAHA session
 * @param phone - Phone number in international format
 * @returns Session information
 * @throws Error if session retrieval fails
 */
export async function getSession(phone: string): Promise<WAHASession> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.get<WAHASession>(
      `/api/sessions/${normalizedPhone}`,
    );

    return response.data;
  } catch (error) {
    console.error(`[WAHA] Failed to get session for ${phone}:`, error);
    throw new Error(
      `Failed to get WAHA session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Delete a WAHA session
 * @param phone - Phone number in international format
 * @returns True if deletion was successful
 * @throws Error if session deletion fails
 */
export async function deleteSession(phone: string): Promise<boolean> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    await wahaClient.delete(`/api/sessions/${normalizedPhone}`);

    console.log(`[WAHA] Session deleted for ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error(`[WAHA] Failed to delete session for ${phone}:`, error);
    throw new Error(
      `Failed to delete WAHA session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Download QR code image for a session
 * @param phone - Phone number in international format
 * @returns QR code image as Buffer
 * @throws Error if QR code download fails
 */
export async function downloadQRCode(phone: string): Promise<Buffer> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.get(
      `/api/${normalizedPhone}/auth/qr?format=image`,
      {
        responseType: "arraybuffer", // Important: get image as binary data
      },
    );

    console.log(`[WAHA] QR code downloaded for ${normalizedPhone}`);
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`[WAHA] Failed to download QR code for ${phone}:`, error);
    throw new Error(
      `Failed to download QR code: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Start a WAHA session after it has been paired
 * @param phone - Phone number in international format
 * @returns Session information after start
 * @throws Error if session start fails
 */
export async function startSession(phone: string): Promise<WAHASession> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.post<WAHASession>(
      `/api/sessions/${normalizedPhone}/start`,
    );

    console.log(`[WAHA] Session started for ${normalizedPhone}`);
    return response.data;
  } catch (error) {
    console.error(`[WAHA] Failed to start session for ${phone}:`, error);
    throw new Error(
      `Failed to start WAHA session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Stop a WAHA session
 * @param phone - Phone number in international format
 * @returns True if stop was successful
 * @throws Error if session stop fails
 */
export async function stopSession(phone: string): Promise<boolean> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    await wahaClient.post(`/api/sessions/${normalizedPhone}/stop`);

    console.log(`[WAHA] Session stopped for ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error(`[WAHA] Failed to stop session for ${phone}:`, error);
    throw new Error(
      `Failed to stop WAHA session: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Get all WAHA sessions
 * @returns List of all sessions
 * @throws Error if retrieval fails
 */
export async function getAllSessions(): Promise<WAHASession[]> {
  try {
    const response = await wahaClient.get<WAHASession[]>("/api/sessions");
    return response.data;
  } catch (error) {
    console.error("[WAHA] Failed to get all sessions:", error);
    throw new Error(
      `Failed to get all WAHA sessions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR ANTI-BLOCKING
// ============================================================================

/**
 * Generate a random delay in milliseconds
 * @param minSeconds - Minimum delay in seconds
 * @param maxSeconds - Maximum delay in seconds
 * @returns Delay in milliseconds
 */
export function getRandomDelay(
  minSeconds: number,
  maxSeconds: number,
): number {
  return (
    Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) *
    1000
  );
}

/**
 * Calculate typing delay based on message length (human-like behavior)
 * @param message - The message to calculate delay for
 * @returns Typing delay in milliseconds
 */
export function getTypingDelayBasedOnMessageLength(message: string): number {
  // Base delay: 10ms per character, capped at 3 seconds
  const base = Math.min(message.length * 10, 3000);
  // Random additional delay: 0.5 to 1.5 seconds
  const random = getRandomDelay(0.5, 1.5);
  // Total delay capped at 20 seconds maximum
  const totalDelay = base + random;
  return Math.min(totalDelay, 20000);
}

/**
 * Sleep utility function
 * @param milliseconds - Time to sleep in milliseconds
 */
export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// ============================================================================
// MESSAGING API FUNCTIONS
// ============================================================================

/**
 * Send "seen" status to a chat
 * @param phone - Phone number (session)
 * @param chatId - WhatsApp chat ID
 * @returns API response
 */
export async function sendSeen(
  phone: string,
  chatId: string,
): Promise<any> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.post("/api/sendSeen", {
      chatId,
      session: normalizedPhone,
    });

    console.log(`[WAHA] Sent seen to chat ${chatId}`);
    return response.data;
  } catch (error) {
    console.warn(`[WAHA] Failed to send seen to ${chatId}:`, error);
    return null;
  }
}

/**
 * Start typing indicator in a chat
 * @param phone - Phone number (session)
 * @param chatId - WhatsApp chat ID
 * @returns API response
 */
export async function startTyping(
  phone: string,
  chatId: string,
): Promise<any> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.post("/api/startTyping", {
      chatId,
      session: normalizedPhone,
    });

    console.log(`[WAHA] Started typing in chat ${chatId}`);
    return response.data;
  } catch (error) {
    console.warn(`[WAHA] Failed to start typing in ${chatId}:`, error);
    return null;
  }
}

/**
 * Stop typing indicator in a chat
 * @param phone - Phone number (session)
 * @param chatId - WhatsApp chat ID
 * @returns API response
 */
export async function stopTyping(
  phone: string,
  chatId: string,
): Promise<any> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.post("/api/stopTyping", {
      chatId,
      session: normalizedPhone,
    });

    console.log(`[WAHA] Stopped typing in chat ${chatId}`);
    return response.data;
  } catch (error) {
    console.warn(`[WAHA] Failed to stop typing in ${chatId}:`, error);
    return null;
  }
}

/**
 * Send a text message to a chat with anti-blocking measures
 * @param phone - Phone number (session)
 * @param chatId - WhatsApp chat ID
 * @param message - Message text to send
 * @returns API response
 */
export async function sendTextMessage(
  phone: string,
  chatId: string,
  message: string,
): Promise<any> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    console.log(
      `[WAHA] Starting anti-blocking message sequence for chat ${chatId}`,
    );

    // Step 1: Send seen
    await sendSeen(normalizedPhone, chatId);
    await sleep(getRandomDelay(1, 2));

    // Step 2: Start typing
    await startTyping(normalizedPhone, chatId);

    // Step 3: Simulate typing delay
    const typingDelay = getTypingDelayBasedOnMessageLength(message);
    console.log(
      `[WAHA] Simulating typing for ${typingDelay}ms for message: "${message.substring(0, 50)}..."`,
    );
    await sleep(typingDelay);

    // Step 4: Stop typing
    await stopTyping(normalizedPhone, chatId);
    await sleep(getRandomDelay(0.5, 1.5));

    // Step 5: Send the actual message
    const response = await wahaClient.post("/api/sendText", {
      text: message,
      chatId,
      reply_to: null,
      linkPreview: false,
      linkPreviewHighQuality: false,
      session: normalizedPhone,
    });

    console.log(`[WAHA] Anti-blocking message sequence completed for ${chatId}`);
    return response.data;
  } catch (error) {
    console.error(
      `[WAHA] Failed in anti-blocking sequence for ${chatId}:`,
      error,
    );
    // Fallback: try to send the message directly
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await wahaClient.post("/api/sendText", {
        text: message,
        chatId,
        reply_to: null,
        linkPreview: false,
        linkPreviewHighQuality: false,
        session: normalizedPhone,
      });
      return response.data;
    } catch (fallbackError) {
      throw new Error(
        `Failed to send message: ${
          fallbackError instanceof Error
            ? fallbackError.message
            : "Unknown error"
        }`,
      );
    }
  }
}

/**
 * Send an image to a chat with anti-blocking measures
 * @param phone - Phone number (session)
 * @param chatId - WhatsApp chat ID
 * @param imageUrl - URL of the image to send
 * @returns API response
 */
export async function sendImage(
  phone: string,
  chatId: string,
  imageUrl: string,
): Promise<any> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    console.log(
      `[WAHA] Starting anti-blocking image send sequence for chat ${chatId}`,
    );

    // Add delay before sending image
    await sleep(getRandomDelay(2, 4));

    // Start typing
    await startTyping(normalizedPhone, chatId);

    // Wait (simulating time to prepare/upload image)
    await sleep(getRandomDelay(3, 6));

    // Stop typing
    await stopTyping(normalizedPhone, chatId);

    // Small delay before actual send
    await sleep(getRandomDelay(1, 2));

    const response = await wahaClient.post("/api/sendImage", {
      chatId,
      file: {
        mimetype: "image/jpeg",
        filename: "image.jpg",
        url: encodeURI(imageUrl),
      },
      reply_to: null,
      session: normalizedPhone,
    });

    console.log(`[WAHA] Anti-blocking image send sequence completed for ${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`[WAHA] Failed to send image to ${chatId}:`, error);
    throw new Error(
      `Failed to send image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Send a video to a chat with anti-blocking measures
 * @param phone - Phone number (session)
 * @param chatId - WhatsApp chat ID
 * @param videoUrl - URL of the video to send
 * @returns API response
 */
export async function sendVideo(
  phone: string,
  chatId: string,
  videoUrl: string,
): Promise<any> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    console.log(
      `[WAHA] Starting anti-blocking video send sequence for chat ${chatId}`,
    );

    // Add delay before sending video
    await sleep(getRandomDelay(3, 6));

    // Start typing
    await startTyping(normalizedPhone, chatId);

    // Wait longer for video (simulating time to prepare/upload video)
    await sleep(getRandomDelay(5, 10));

    // Stop typing
    await stopTyping(normalizedPhone, chatId);

    // Small delay before actual send
    await sleep(getRandomDelay(1, 3));

    const response = await wahaClient.post("/api/sendImage", {
      chatId,
      file: {
        mimetype: "video/mp4",
        filename: "video.mp4",
        url: encodeURI(videoUrl),
      },
      reply_to: null,
      session: normalizedPhone,
    });

    console.log(`[WAHA] Anti-blocking video send sequence completed for ${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`[WAHA] Failed to send video to ${chatId}:`, error);
    throw new Error(
      `Failed to send video: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Get all chats for a session
 * @param phone - Phone number (session)
 * @returns List of chats
 */
export async function getChats(phone: string): Promise<any[]> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    const response = await wahaClient.get(
      `/api/${normalizedPhone}/chats?sortOrder=desc&limit=100`,
    );

    return response.data;
  } catch (error) {
    console.error(`[WAHA] Failed to get chats for ${phone}:`, error);
    return [];
  }
}
