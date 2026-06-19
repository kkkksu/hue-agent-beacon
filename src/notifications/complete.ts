import { readConfig, type Config } from "../config";
import { getLight, restorePayload, setLight, type HueLight } from "../hue";
import { sleep } from "../utils";

export type CompleteDeps = {
  readConfig: () => Promise<Config>;
  getLight: (config: Config) => Promise<HueLight | undefined>;
  setLight: (config: Config, body: unknown) => Promise<void>;
  sleep: (ms: number) => Promise<unknown>;
  log: (message: string) => void;
};

const defaultDeps: CompleteDeps = {
  readConfig,
  getLight,
  setLight,
  sleep,
  log: console.log,
};

const COMPLETE_FLASH_MS = 1_000;

const completePayload = {
  on: { on: true },
  dimming: { brightness: 100 },
  color: { xy: { x: 0.17, y: 0.7 } },
};

export async function notifyComplete(deps = defaultDeps): Promise<void> {
  const config = await deps.readConfig();
  const previousLight = await deps.getLight(config);

  await deps.setLight(config, completePayload);

  await deps.sleep(COMPLETE_FLASH_MS);

  await deps.setLight(config, restorePayload(previousLight));

  deps.log("✅ Complete notification sent");
}
