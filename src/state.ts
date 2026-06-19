import { readFile, unlink, writeFile } from "node:fs/promises";
import type { HueLight } from "./hue";

const STATE_PATH = ".hue-agent-beacon-state.json";

export type BeaconState = {
  activeEvent: "waiting_for_user";
  lightId: string;
  previousLight?: HueLight;
};

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export async function readState(): Promise<BeaconState | undefined> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    return JSON.parse(raw) as BeaconState;
  } catch (error) {
    if (isMissingFileError(error)) return undefined;
    throw error;
  }
}

export async function writeState(state: BeaconState): Promise<void> {
  await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function clearState(): Promise<void> {
  try {
    await unlink(STATE_PATH);
  } catch (error) {
    if (isMissingFileError(error)) return;
    throw error;
  }
}
