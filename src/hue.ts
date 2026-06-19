import https from "node:https";
import type { Config } from "./config";

export type HueLight = {
  on?: { on: boolean };
  dimming?: { brightness?: number };
  color?: { xy?: { x: number; y: number } };
};

export function hueRequest<T>(
  config: Config,
  method: "GET" | "PUT",
  path: string,
  body?: unknown,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;

    const request = https.request(
      {
        hostname: config.bridgeIp,
        path,
        method,
        rejectUnauthorized: false,
        headers: {
          "hue-application-key": config.applicationKey,
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Hue API ${response.statusCode}: ${responseBody}`));
            return;
          }

          resolve(responseBody ? (JSON.parse(responseBody) as T) : ({} as T));
        });
      },
    );

    request.on("error", reject);

    if (data) request.write(data);
    request.end();
  });
}

export async function getLight(config: Config): Promise<HueLight | undefined> {
  const result = await hueRequest<{ data?: HueLight[] }>(
    config,
    "GET",
    `/clip/v2/resource/light/${config.lightId}`,
  );

  return result.data?.[0];
}

export async function setLight(config: Config, body: unknown): Promise<void> {
  await hueRequest(config, "PUT", `/clip/v2/resource/light/${config.lightId}`, body);
}

export function restorePayload(light: HueLight | undefined) {
  if (!light) return { on: { on: false } };

  return {
    ...(light.on ? { on: light.on } : {}),
    ...(light.dimming?.brightness !== undefined
      ? { dimming: { brightness: light.dimming.brightness } }
      : {}),
    ...(light.color?.xy ? { color: { xy: light.color.xy } } : {}),
  };
}
