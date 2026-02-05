import cron from "node-cron";
import { _orchestrator } from "./_orchestrator";

cron.schedule("* * * * *", async () => {
  await _orchestrator(true);
});
