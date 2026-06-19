import { readConfig, type Config } from "../config";
import { getLight, restorePayload, setLight, type HueLight } from "../hue";
import { sleep } from "../utils";

export type ErrorDeps = {
  readConfig: () => Promise<Config>;
  getLight: (config: Config) => Promise<HueLight | undefined>;
  setLight: (config: Config, body: unknown) => Promise<void>;
  sleep: (ms: number) => Promise<unknown>;
  log: (message: string) => void;
};

const defaultDeps: ErrorDeps = {
  readConfig,
  getLight,
  setLight,
  sleep,
  log: console.log,
};

const redWithBreathe = {
  on: { on: true },
  dimming: { brightness: 100 },
  color: { xy: { x: 0.7, y: 0.3 } },
  alert: { action: "breathe" },
};

const redStatic = {
  on: { on: true },
  dimming: { brightness: 100 },
  color: { xy: { x: 0.7, y: 0.3 } },
};

export async function notifyError(deps = defaultDeps): Promise<void> {
  const config = await deps.readConfig();
  const previousLight = await deps.getLight(config);

  try {
    await deps.setLight(config, redWithBreathe);
  } catch {
    await deps.setLight(config, redStatic);
  }

  await deps.sleep(1_500);

  await deps.setLight(config, restorePayload(previousLight));

  deps.log("✅ Error notification sent");
}
