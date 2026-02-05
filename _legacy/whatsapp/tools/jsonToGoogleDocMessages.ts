const moment = require("moment"); // Ensure moment is available
const { MESSAGES_WH } = require("../config/messages/tcd");

const NEW_MESSAGES = [];

export const convert = () => {
  for (let i in MESSAGES_WH) {
    const message = MESSAGES_WH[i];

    // Check if sendOn is a function, and evaluate it to get the date
    const sendOnDate = message.sendOn
      ? message.sendOn(moment().set("hour", 19).set("minute", 0))
      : null;

    // Calculate the relative day difference (e.g., -1 day, 0 day, +3 day)
    let sendOnDay = "Not Available";
    if (sendOnDate) {
      const diffInDays = sendOnDate.diff(moment(), "days"); // Difference in days
      // const plusSymbol = diffInDays > 0 ? "+" : "";
      sendOnDay = `${diffInDays} day${Math.abs(diffInDays) === 1 ? "" : "s"}`;
      // if (plusSymbol) {
      //   sendOnDay = `${plusSymbol}${sendOnDay}`;
      // }
    }

    // Extract the hour and minute from the sendOn function
    const sendOnHour = sendOnDate
      ? sendOnDate.format("HH:mm")
      : "Not Available";

    // Create a new message object with the required properties
    const newMessage = {
      who: message?.who || "",
      sendOnDay: sendOnDay,
      sendOnHour: sendOnHour,
      messageTemplate: message.message().toString(),
      image: message?.image || "",
      video: message?.video || "",
    };

    console.log(
      `${newMessage?.who}\t${newMessage?.sendOnDay}\t${newMessage?.sendOnHour}\t${newMessage?.messageTemplate}\t${newMessage?.image || ""}\t${newMessage?.video || ""}`,
    );

    NEW_MESSAGES.push(newMessage);
  }

  // https://products.aspose.app/cells/conversion/json-to-xlsx
  console.log("[INFO] Converting to JSON format for Google Docs");
  console.log(
    "[INFO] --> Utiliser le site : https://products.aspose.app/cells/conversion/json-to-xlsx",
  );

  console.log("");
  console.log("");

  console.log(JSON.stringify(NEW_MESSAGES));
};

convert();
