import {
  apiWahaSendMessageToChannel,
  apiWahaSendSeen,
  apiWahaStartTyping,
  apiWahaStopTyping,
  getTypingDelayBasedOnMessageLength,
  getRandomDelay,
  sleep
} from "../api/waha";

export const sendMessage = async (channelId: string, message: string, who: string) => {
  console.log("[INFO] Starting anti-blocking message sequence for channel:", channelId);

  try {
    // Step 1: Send seen before processing the message
    await apiWahaSendSeen(channelId, who);

    // Small delay after seen (1-2 seconds)
    await sleep(getRandomDelay(1, 2));

    // Step 2: Start typing before sending message
    await apiWahaStartTyping(channelId, who);

    // Step 3: Wait for a random interval based on message length (human-like typing)
    const typingDelay = getTypingDelayBasedOnMessageLength(message);
    console.log(`[INFO] Simulating typing for ${typingDelay}ms for message: "${message.substring(0, 50)}..."`);
    await sleep(typingDelay);

    // Step 4: Stop typing before sending the message
    await apiWahaStopTyping(channelId, who);

    // Small delay before sending (0.5-1.5 seconds)
    await sleep(getRandomDelay(0.5, 1.5));

    // Step 5: Send the actual message
    const result = await apiWahaSendMessageToChannel(channelId, message, who);

    console.log("[INFO] Anti-blocking message sequence completed successfully");
    return result;

  } catch (error) {
    console.error("[ERROR] Failed in anti-blocking message sequence:", error);
    // Fallback: try to send the message directly if the sequence fails
    console.log("[INFO] Attempting fallback direct message send");
    return await apiWahaSendMessageToChannel(channelId, message, who);
  }
};
