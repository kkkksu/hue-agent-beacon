import { readConfig } from "../config";
import { getLight, restorePayload, setLight } from "../hue";
import { sleep } from "../utils";

export async function notifyComplete(): Promise<void> {
  const config = await readConfig();
  const previousLight = await getLight(config);

  await setLight(config, {
    on: { on: true },
    dimming: { brightness: 100 },
    color: { xy: { x: 0.17, y: 0.7 } },
  });

  await sleep(1_000);

  await setLight(config, restorePayload(previousLight));

  console.log("✅ Complete notification sent");
}
