import { readConfig } from "../config";
import { getLight, setLight } from "../hue";
import { readState, writeState } from "../state";

export async function notifyWaitingForUser(): Promise<void> {
  const config = await readConfig();
  const existingState = await readState();
  const previousLight = existingState?.lightId === config.lightId ? existingState.previousLight : await getLight(config);

  if (!existingState || existingState.lightId !== config.lightId) {
    await writeState({
      activeEvent: "waiting_for_user",
      lightId: config.lightId,
      previousLight,
    });
  }

  try {
    await setLight(config, {
      on: { on: true },
      dimming: { brightness: 90 },
      color: { xy: { x: 0.44, y: 0.52 } },
      alert: { action: "breathe" },
    });
  } catch {
    await setLight(config, {
      on: { on: true },
      dimming: { brightness: 90 },
      color: { xy: { x: 0.44, y: 0.52 } },
    });
  }

  console.log("✅ Waiting-for-user notification sent");
}
