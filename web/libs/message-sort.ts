/**
 * Sort messages by planned execution date (sendOnDay + sendOnHour)
 */

export interface MessageWithSchedule {
  sendOnDay: string;
  sendOnHour: string;
  [key: string]: any;
}

/**
 * Convert time string to minutes
 * @param timeStr - Time in format "HH:MM"
 * @returns Total minutes
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Sort messages by sendOnDay (ascending) then sendOnHour (ascending)
 * @param messages - Array of messages to sort
 * @returns Sorted array of messages
 */
export function sortMessagesBySchedule<T extends MessageWithSchedule>(
  messages: T[]
): T[] {
  return [...messages].sort((a, b) => {
    // First, compare by day
    const dayA = parseInt(a.sendOnDay);
    const dayB = parseInt(b.sendOnDay);

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    // If same day, compare by time
    const timeA = timeToMinutes(a.sendOnHour);
    const timeB = timeToMinutes(b.sendOnHour);

    return timeA - timeB;
  });
}
