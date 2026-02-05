import express from "express";
import { getData, setData } from "./config/database";
import { createChannel } from "./controllers/createChannel";
import { sendMessage } from "./controllers/sendMessage";
import { apiWahaSetGroupPicture } from "./api/waha";
import { _orchestrator } from "./controllers/_orchestrator";
import { isDev } from "./utils/envs";

const app = express();
const port = 4444;

require("dotenv").config();

if (!isDev()) {
  require("./controllers/cronMessages");
}

app.get("/", async (req, res) => {
  res.send("Hello World!");
  let test = await getData("test");
  console.log("Test", test);
  await setData("test", "Hello World!");
  test = await getData("test");
  console.log("Test", test);
});

app.get("/test", async (req, res) => {
  const channel = await createChannel();
  const channelId = channel?.gid?._serialized;
  const responseImage = await apiWahaSetGroupPicture(channelId);
  const message = await sendMessage(channelId, "Hello World!", "jbexcel");
  res.send({
    channelId: channelId,
    responseImage,
    message,
  });
});

app.get("/messages", async (req, res) => {
  const responseOrchestrator = await _orchestrator(false);

  res.send({
    responseOrchestrator,
    hello: "world",
  });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
