import { CONFIG } from "../../config/config";
import { Moment } from "moment";
import moment from "moment/moment";

export const getMessages = async (
  messageTemplate: string,
  options?: {
    webinarUrl?: boolean;
    hourWebinar?: string;
  },
) => {
  const { webinarUrl = "", hourWebinar = "" } = options || {};

  // Exemple : [Messages] Original, [Messages] TCD
  let MESSAGES_WH = await fetch(
    CONFIG.SPREADSHIT_CONFIG_WH("[Messages] " + messageTemplate),
  ).then((res) => res.json());

  MESSAGES_WH = getDataWithHeaderGoogleSheet(MESSAGES_WH);

  MESSAGES_WH.map((item) => {
    // Send on function - correspondance avec le legacy (JSON messages)
    // Maintenant on utilise des nouveaux champs dans Excel : sendOnDay et sendOnHour
    item.sendOn = (date: Moment) => {
      const resultDate = date.clone();

      // Gérer sendOnDay
      const dayMatch = item.sendOnDay?.match(
        /([+-]?\d+)\s*(day|days|hour|hours|minute|minutes)/i,
      );
      if (dayMatch) {
        const amount = parseInt(dayMatch[1]);
        const unit =
          dayMatch[2].toLowerCase() as moment.unitOfTime.DurationConstructor;
        resultDate.add(amount, unit);
      }

      // Gérer sendOnHour
      const hourMatch = item.sendOnHour?.match(/(\d{1,2}):(\d{2})/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1]);
        const minute = parseInt(hourMatch[2]);
        resultDate.set({ hour, minute, second: 0, millisecond: 0 });
      }

      return resultDate;
    };

    item.message = () => {
      const variables = {
        webinarUrl,
        hourWebinar,
      };

      if(!item?.messageTemplate) {
          return '';
      }

      return item.messageTemplate.replace(/{{\s*(\w+)\s*}}/gi, (_, key) => {
        const variableKey = key.trim().toLowerCase();
        const foundKey = Object.keys(variables).find(
          (k) => k.toLowerCase() === variableKey,
        );
        return foundKey ? variables[foundKey] : "";
      });
    };
  });

  return MESSAGES_WH;
};

export const getDataWithHeaderGoogleSheet = (dataSpreadshit: any) => {
  const values = dataSpreadshit?.values;

  if (!values || !Array.isArray(values) || values.length < 2) {
    console.warn("No data found or missing headers");
    return [];
  }

  const headers = values[0];
  const data = values.slice(1);

  const dataWithHeaders = data.map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? null; // Remplir avec null si la donnée manque
    });
    return obj;
  });

  return dataWithHeaders;
};
