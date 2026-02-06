/**
 * Sort messages by planned execution date (sendOnDay + sendOnHour)
 * Supports fixed_time, event_time, and relative_time with signed hours
 */

export interface MessageWithSchedule {
  sendOnDay: string;
  sendOnHour: string;
  sendTimeType?: "fixed_time" | "event_time" | "relative_time";
  [key: string]: any;
}

/**
 * Convert time string to minutes (unsigned, for fixed_time)
 * @param timeStr - Time in format "HH:MM"
 * @returns Total minutes
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Parse a signed time string like "-06:30" or "02:15" into signed total minutes
 * @param timeStr - Time in format "-HH:MM" or "HH:MM"
 * @returns Signed total minutes (e.g., "-06:30" → -390)
 */
function signedTimeToMinutes(timeStr: string): number {
  const negative = timeStr.startsWith("-");
  const clean = negative ? timeStr.slice(1) : timeStr;
  const [hours, minutes] = clean.split(":").map(Number);
  const total = (hours || 0) * 60 + (minutes || 0);
  return negative ? -total : total;
}

/**
 * Calculate a unified score in minutes relative to the event for sorting.
 * - event_time → 0
 * - fixed_time → day * 1440 + timeToMinutes(sendOnHour)
 * - relative_time → day * 1440 + signedTimeToMinutes(sendOnHour)
 */
function getScheduleScore(msg: MessageWithSchedule): number {
  const type = msg.sendTimeType || "fixed_time";

  if (type === "event_time") {
    return 0;
  }

  const day = parseInt(msg.sendOnDay) || 0;

  if (type === "relative_time") {
    return day * 1440 + signedTimeToMinutes(msg.sendOnHour);
  }

  // fixed_time
  return day * 1440 + timeToMinutes(msg.sendOnHour);
}

/**
 * Sort messages by unified schedule score (ascending)
 * @param messages - Array of messages to sort
 * @returns Sorted array of messages
 */
export function sortMessagesBySchedule<T extends MessageWithSchedule>(
  messages: T[]
): T[] {
  return [...messages].sort((a, b) => {
    return getScheduleScore(a) - getScheduleScore(b);
  });
}
