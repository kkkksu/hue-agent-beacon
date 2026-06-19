import { readConfig } from "../config";
import { restorePayload, setLight } from "../hue";
import { clearState, readState } from "../state";

export async function ack(): Promise<void> {
  const config = await readConfig();
  const state = await readState();

  if (!state) {
    console.log("No active notification to acknowledge");
    return;
  }

  if (state.lightId !== config.lightId) {
    throw new Error(`State light ${state.lightId} does not match config light ${config.lightId}`);
  }

  await setLight(config, restorePayload(state.previousLight));
  await clearState();

  console.log("✅ Notification acknowledged and light restored");
}
