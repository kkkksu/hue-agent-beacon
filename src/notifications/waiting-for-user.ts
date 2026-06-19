import { readConfig, type Config } from "../config";
import { getLight, setLight, type HueLight } from "../hue";
import { readState, writeState, type BeaconState } from "../state";

export type WaitingForUserDeps = {
  readConfig: () => Promise<Config>;
  readState: () => Promise<BeaconState | undefined>;
  writeState: (state: BeaconState) => Promise<void>;
  getLight: (config: Config) => Promise<HueLight | undefined>;
  setLight: (config: Config, body: unknown) => Promise<void>;
  log: (message: string) => void;
};

const defaultDeps: WaitingForUserDeps = {
  readConfig,
  readState,
  writeState,
  getLight,
  setLight,
  log: console.log,
};

const waitingPayload = {
  on: { on: true },
  dimming: { brightness: 90 },
  color: { xy: { x: 0.44, y: 0.52 } },
};

const waitingBreathePayload = {
  ...waitingPayload,
  alert: { action: "breathe" },
};

export async function notifyWaitingForUser(deps = defaultDeps): Promise<void> {
  const config = await deps.readConfig();
  const existingState = await deps.readState();
  const hasCurrentLightSnapshot = existingState?.lightId === config.lightId;
  const previousLight = hasCurrentLightSnapshot ? existingState.previousLight : await deps.getLight(config);

  if (!hasCurrentLightSnapshot) {
    await deps.writeState({
      activeEvent: "waiting_for_user",
      lightId: config.lightId,
      previousLight,
    });
  }

  try {
    await deps.setLight(config, waitingBreathePayload);
  } catch {
    await deps.setLight(config, waitingPayload);
  }

  deps.log("✅ Waiting-for-user notification sent");
}
