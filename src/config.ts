import { readFile } from "node:fs/promises";

export type Config = {
  bridgeIp: string;
  applicationKey: string;
  lightId: string;
};

export async function readConfig(): Promise<Config> {
  const raw = await readFile("config.json", "utf8");
  return JSON.parse(raw) as Config;
}
