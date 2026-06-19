import { readConfig, type Config } from "../config";
import { restorePayload, setLight } from "../hue";
import { clearState, readState, type BeaconState } from "../state";

export type RestoreReason = "ack" | "resumed";

export type RestoreWaitingNotificationDeps = {
  readConfig: () => Promise<Config>;
  readState: () => Promise<BeaconState | undefined>;
  setLight: (config: Config, body: unknown) => Promise<void>;
  clearState: () => Promise<void>;
  log: (message: string) => void;
};

const defaultDeps: RestoreWaitingNotificationDeps = {
  readConfig,
  readState,
  setLight,
  clearState,
  log: console.log,
};

const successMessage: Record<RestoreReason, string> = {
  ack: "✅ Notification acknowledged and light restored",
  resumed: "✅ Agent resumed and light restored",
};

const noStateMessage: Record<RestoreReason, string> = {
  ack: "No active notification to acknowledge",
  resumed: "No waiting notification to resume from",
};

export async function restoreWaitingNotification(reason: RestoreReason, deps = defaultDeps): Promise<void> {
  const config = await deps.readConfig();
  const state = await deps.readState();

  if (!state) {
    deps.log(noStateMessage[reason]);
    return;
  }

  if (state.lightId !== config.lightId) {
    throw new Error(`State light ${state.lightId} does not match config light ${config.lightId}`);
  }

  await deps.setLight(config, restorePayload(state.previousLight));
  await deps.clearState();

  deps.log(successMessage[reason]);
}
