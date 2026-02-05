import { CONFIG } from "../config/config";
import moment from "moment";
import { getData, setData } from "../config/database";
import { sendMessage } from "./sendMessage";
import {
  apiWahaGetMasterclassConvs,
  apiWahaSendImage,
  apiWahaSendVideo,
} from "../api/waha";
import {
  getDataWithHeaderGoogleSheet,
  getMessages,
} from "../_features/messages/getMessages";
import { isDev as isDevEnv } from "../utils/envs";

let DEV_MODE = isDevEnv();
let FORCE_SEND = false;
let FORCE_SEND_BY_DEFAULT_SESSION = false;

type TypeRow = {
  who: string;
  sendOnDay: string;
  sendOnHour: string;
  message: string;
  image: string;
  video: string;
};

let sheet = "MessagesWhatsApp";
if(DEV_MODE) {
  sheet = "[DEV JB] " + sheet;
}

export const _orchestrator = async (isFromCron: boolean) => {
  console.log("[INFO] Running _orchestrator");

  /**
   * First
   * We fetch all the webinars.
   */
  const dataSpreadshit = await fetch(
    CONFIG.SPREADSHIT_CONFIG_WH(sheet),
  ).then((res) => res.json());
  //
  // console.log("[INFO] Fetched data from spreadshit", dataSpreadshit);
  // process.exit(0);

  const dataWithHeaders = getDataWithHeaderGoogleSheet(dataSpreadshit);

  /**
   * Pour chaque webinar.
   */
  let IS_DEV_CONV = false;
  for (const data of dataWithHeaders) {
    const {
      date,
      isLive,
      isDev = 0,
      webinarLink,
      groupName,
      messageTemplate,
    } = data;

    IS_DEV_CONV = isDev.toString() === "1";

    console.log("[INFO] Orchestrator. Dev mode ? ", IS_DEV_CONV);

    if (isFromCron && IS_DEV_CONV) {
      // abort if it's a dev conv and we're running from cron
      console.log("[INFO] Skipping dev conv in orchestrator");
      continue;
    }

    const momentDate = moment(date, "DD/MM/YYYY HH:mm");

    const MESSAGES_WH = await getMessages(messageTemplate, {
      webinarUrl: webinarLink,
      hourWebinar: momentDate.format("HH"),
    });

    if (IS_DEV_CONV) {
      FORCE_SEND_BY_DEFAULT_SESSION = true;
    }

    // get convs
    const convs = await apiWahaGetMasterclassConvs(
      FORCE_SEND_BY_DEFAULT_SESSION ? "default" : CONFIG.SESSION_WAHA,
    );

    const masterClassConvs = convs
      ?.filter((conv) => {
        const subject = conv?.groupMetadata?.subject || "";
        // console.log('[INFO] Checking conv subject:', subject, 'against groupName:', groupName);
        return subject === groupName;
      })
      ?.map((i) => {
        const subject = i?.groupMetadata?.subject || "";

        return {
          id: i?.groupMetadata?.id?._serialized,
          name: subject,
          lastMessage: i?.lastMessage,
        };
      });

    if(isDevEnv()) {
      console.log('[INFO] Masterclass convs found : ', masterClassConvs);
    }

    const now = moment();

    let index = 0;

    /**
     * Pour chaque message WhatsApp.
     */
    for (const m of MESSAGES_WH) {
      index++;
      const messageExecutionDate = m.sendOn(momentDate.clone());

      /**
       * Pour chaque conv qui prends le nom du webinar (il peut y
       * en avoir deux à cause des communautés).
       */
      for (let j in masterClassConvs) {
        try {
          const masterClassConv = masterClassConvs[j];
          const masterClassUniqueID = masterClassConv?.id;
          const lastSentMessageIndex = await getData(masterClassUniqueID);
          let shouldSend =
            !lastSentMessageIndex || index > parseInt(lastSentMessageIndex);

          console.log("[INFO] Checking if should send message:", {
            masterClassUniqueID,
            index,
            lastSentMessageIndex,
            shouldSend,
            messageExecutionDate:
              messageExecutionDate.format("DD/MM/YYYY HH:mm"),
            now: now.format("DD/MM/YYYY HH:mm"),
          });

          if ((now.isAfter(messageExecutionDate) && shouldSend) || FORCE_SEND) {
            const { id } = masterClassConv;
            const theMessage = m
              .message(isLive, webinarLink, momentDate.clone())
              .trim();
            let who = m?.who || CONFIG.SESSION_WAHA;
            if (FORCE_SEND_BY_DEFAULT_SESSION) {
              who = "default";
            }

            if (IS_DEV_CONV) {
              FORCE_SEND = true;
              who = "default"; // Force to use the default session for dev convs
            }

            if (shouldSend || FORCE_SEND) {
              await setData(masterClassUniqueID, index);

              console.log("[INFO] Sending message with anti-blocking measures");
              await sendMessage(id, theMessage, who);

              if (m?.image) {
                console.log("[INFO] Sending image with anti-blocking measures");
                await apiWahaSendImage(id, encodeURI(m?.image), who);
              }

              if (m?.video) {
                console.log("[INFO] Sending video with anti-blocking measures");
                await apiWahaSendVideo(id, encodeURI(m?.video), who);
              }

              // Add delay between different message groups to avoid bulk sending detection
              // Following WhatsApp guidelines: reasonable delays between message packages
              const groupDelay = Math.floor(Math.random() * (20 - 5 + 1) + 5) * 1000; // 5–20 seconds
              console.log(`[INFO] Waiting ${groupDelay/1000} seconds before next message group (anti-blocking measure)`);
              await new Promise(resolve => setTimeout(resolve, groupDelay));
            }
          }
        } catch (err) {
          console.warn("[ERROR] Error while sending message", err);
        }
      }
    }
  }

  return {
    dataWithHeaders,
  };
};
