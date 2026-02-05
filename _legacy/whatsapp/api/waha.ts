import { CONFIG } from "../config/config";
import fetch from "node-fetch";

const headers = {
  "Content-Type": "application/json",
  "X-Api-Key": "DOKDOKé2O2KAsOKdEOKOEKdkdokdok222kOkdokdo",
  Authorization:
    "Basic " +
    Buffer.from("jbexcel:dkodk2O3Kokdo922290DKokokodd!22").toString("base64"),
};

export const apiWahaCreateChannel = async (name: string) => {
  console.log("Creating channel " + name);

  return fetch(CONFIG.ENDPOINT_WAHA + `/api/${CONFIG.SESSION_WAHA}/groups`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      participants: [],
    }),
  }).then((res) => {
    return res.json();
  });
};

export const apiWahaSendMessageToChannel = async (
  channelId: string,
  message: string,
  who: string,
) => {
  console.log("[INFO] Sending message to channel " + channelId, { who });

  const response = fetch(CONFIG.ENDPOINT_WAHA + `/api/sendText`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: message,
      chatId: channelId,
      reply_to: null,
      linkPreview: false,
      linkPreviewHighQuality: false,
      session: who || CONFIG.SESSION_WAHA,
    }),
  });

  return response;
};

// /api/{session}/groups/{id}/picture
export const apiWahaSetGroupPicture = async (channelId: string) => {
  console.log("Setting picture to channel " + channelId);

  fetch(
    CONFIG.ENDPOINT_WAHA +
      `/api/${CONFIG.SESSION_WAHA}/groups/${channelId}/description`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        description: "Description du groupe",
      }),
    },
  ).then((res) => {
    return res.json();
  });

  return fetch(
    CONFIG.ENDPOINT_WAHA +
      `/api/${CONFIG.SESSION_WAHA}/groups/${channelId}/picture`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        file: {
          mimetype: "image/jpeg",
          filename: "filename.jpg",
          url: "https://p16-common-sign-va.tiktokcdn-us.com/tos-maliva-avt-0068/e6c2a554ee51225147517d9b3bdbbdad~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=03df0628&x-expires=1743256800&x-signature=4OfIJ%2FKvE2guKsWDrkStvNnNY5s%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast5",
        },
      }),
    },
  ).then((res) => {
    return res.json();
  });
};

export const apiWahaGetMasterclassConvs = async (session) => {
  console.log(
    "Getting masterclass convs",
    headers,
    CONFIG.ENDPOINT_WAHA + `/api/${session}/chats?sortOrder=desc&limit=100`,
  );

  return fetch(
    CONFIG.ENDPOINT_WAHA + `/api/${session}/chats?sortOrder=desc&limit=100`,
    {
      method: "GET",
      headers,
    },
  )
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      console.error("[ERROR] Failed to fetch masterclass conversations", error);
      return [];
    });
};

export const apiWahaSendImage = async (
  channelId: string,
  imageUrl: string,
  who: string,
) => {
  console.log(
    "[INFO] Starting anti-blocking image send sequence for channel:",
    channelId,
  );

  try {
    // Add delay before sending image to avoid spam detection
    await sleep(getRandomDelay(2, 4));

    // Start typing before sending image
    await apiWahaStartTyping(channelId, who);

    // Wait a bit (simulating time to prepare/upload image)
    await sleep(getRandomDelay(3, 6));

    // Stop typing before sending
    await apiWahaStopTyping(channelId, who);

    // Small delay before actual send
    await sleep(getRandomDelay(1, 2));

    const body = JSON.stringify({
      chatId: channelId,
      file: {
        mimetype: "image/jpeg",
        filename: "waha.jpg",
        url: imageUrl,
      },
      reply_to: null,
      session: who || CONFIG.SESSION_WAHA,
    });

    console.log("[INFO] Sending image to channel " + channelId);

    const response = await fetch(CONFIG.ENDPOINT_WAHA + `/api/sendImage`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      console.warn(`Failed to send image: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[INFO] Anti-blocking image send sequence completed");
    return result;
  } catch (error) {
    console.error("Error sending image:", error);
    return null;
  }
};

export const apiWahaSendVideo = async (
  channelId: string,
  videoUrl: string,
  who: string,
) => {
  console.log(
    "[INFO] Starting anti-blocking video send sequence for channel:",
    channelId,
  );

  try {
    // Add delay before sending video to avoid spam detection
    await sleep(getRandomDelay(3, 6));

    // Start typing before sending video
    await apiWahaStartTyping(channelId, who);

    // Wait longer for video (simulating time to prepare/upload video)
    await sleep(getRandomDelay(5, 10));

    // Stop typing before sending
    await apiWahaStopTyping(channelId, who);

    // Small delay before actual send
    await sleep(getRandomDelay(1, 3));

    const body = JSON.stringify({
      chatId: channelId,
      file: {
        mimetype: "video/mp4",
        filename: "video.mp4",
        url: videoUrl,
      },
      reply_to: null,
      session: who || CONFIG.SESSION_WAHA,
    });

    console.log("[INFO] Sending video to channel " + channelId);

    const response = await fetch(CONFIG.ENDPOINT_WAHA + `/api/sendImage`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      console.warn(`Failed to send video: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[INFO] Anti-blocking video send sequence completed");
    return result;
  } catch (error) {
    console.error("Error sending video:", error);
    return null;
  }
};

// Utility functions for human-like behavior and anti-blocking measures
export const getRandomDelay = (
  minSeconds: number,
  maxSeconds: number,
): number => {
  return (
    Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) *
    1000
  );
};

export const getTypingDelayBasedOnMessageLength = (message: string): number => {
  // Base delay based on message length (10ms per character, capped at 3 seconds)
  const base = Math.min(message.length * 10, 3000);
  // Random additional delay (0.5 to 1.5 seconds in milliseconds)
  const random = getRandomDelay(0.5, 1.5);
  // Total delay capped at 20 seconds maximum
  const totalDelay = base + random;
  return Math.min(totalDelay, 20000); // Cap at 20 seconds (20000ms)
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Anti-blocking API functions following WhatsApp guidelines
export const apiWahaSendSeen = async (channelId: string, who: string) => {
  console.log("[INFO] Sending seen to channel " + channelId);

  try {
    const response = await fetch(CONFIG.ENDPOINT_WAHA + `/api/sendSeen`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chatId: channelId,
        session: who || CONFIG.SESSION_WAHA,
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to send seen: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending seen:", error);
    return null;
  }
};

export const apiWahaStartTyping = async (channelId: string, who: string) => {
  console.log("[INFO] Starting typing in channel " + channelId);

  try {
    const response = await fetch(CONFIG.ENDPOINT_WAHA + `/api/startTyping`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chatId: channelId,
        session: who || CONFIG.SESSION_WAHA,
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to start typing: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error starting typing:", error);
    return null;
  }
};

export const apiWahaStopTyping = async (channelId: string, who: string) => {
  console.log("[INFO] Stopping typing in channel " + channelId);

  try {
    const response = await fetch(CONFIG.ENDPOINT_WAHA + `/api/stopTyping`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chatId: channelId,
        session: who || CONFIG.SESSION_WAHA,
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to stop typing: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error stopping typing:", error);
    return null;
  }
};
