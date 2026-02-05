import { apiWahaCreateChannel } from "../api/waha";
import moment from "moment";

export const createChannel = async () => {
  const channel = await apiWahaCreateChannel(
    "Webinar " + moment().format("DD-MM-YYYY"),
  );
  console.log("channel", channel);
  return channel;
};
